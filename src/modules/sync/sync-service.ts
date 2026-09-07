import { localDb, LocalOutboxItem } from '@/platform/database/dexie-db';
import { getSupabaseClient, isSupabaseConfigured } from '@/platform/database/supabase-client';

export interface SyncStats {
  pendingCount: number;
  lastSyncAt: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  lastError: string | null;
}

export class SyncService {
  private isSyncing = false;
  private lastSyncAt: string | null = null;
  private lastError: string | null = null;
  private listeners: Array<(stats: SyncStats) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.triggerSync());
      window.addEventListener('offline', () => this.notifyListeners());
    }
  }

  subscribe(listener: (stats: SyncStats) => void): () => void {
    this.listeners.push(listener);
    this.getStats().then((stats) => listener(stats));
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifyListeners() {
    const stats = await this.getStats();
    for (const listener of this.listeners) {
      listener(stats);
    }
  }

  async getStats(): Promise<SyncStats> {
    const pendingCount = await localDb.outbox
      .where('status')
      .anyOf(['pending', 'failed'])
      .count();

    return {
      pendingCount,
      lastSyncAt: this.lastSyncAt,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: this.isSyncing,
      lastError: this.lastError,
    };
  }

  async queueOperation(
    entity: LocalOutboxItem['entity'],
    action: LocalOutboxItem['action'],
    payload: any
  ): Promise<string> {
    const operationId = 'op_' + crypto.randomUUID();
    await localDb.outbox.add({
      id: 'outbox_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      operationId,
      entity,
      action,
      payload,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    });

    this.notifyListeners();
    // Auto-attempt sync if online
    if (navigator.onLine && isSupabaseConfigured()) {
      setTimeout(() => this.triggerSync(), 500);
    }
    return operationId;
  }

  async triggerSync(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, error: 'Sync already in progress' };
    }

    if (!navigator.onLine) {
      return { success: false, syncedCount: 0, error: 'Device is offline' };
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const pendingItems = await localDb.outbox
        .where('status')
        .anyOf(['pending', 'failed'])
        .limit(20)
        .toArray();

      if (pendingItems.length === 0) {
        this.isSyncing = false;
        this.lastSyncAt = new Date().toISOString();
        this.lastError = null;
        this.notifyListeners();
        return { success: true, syncedCount: 0 };
      }

      let syncedCount = 0;

      // Check if Cloud SQL backend ingest is available
      try {
        const response = await fetch('/api/sync/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operations: pendingItems.map((item) => ({
              operationId: item.operationId,
              idempotencyKey: `${item.operationId}_${item.entity}`,
              entity: item.entity,
              action: item.action,
              payload: item.payload,
            })),
          }),
        });

        if (response.ok) {
          for (const item of pendingItems) {
            await localDb.outbox.update(item.id, {
              status: 'synced',
              lastAttemptAt: new Date().toISOString(),
            });
            syncedCount++;
          }
          this.lastSyncAt = new Date().toISOString();
          this.lastError = null;
          return { success: true, syncedCount };
        }
      } catch (cloudSqlErr) {
        // Fallback to Supabase client if available
      }

      const client = getSupabaseClient();

      for (const item of pendingItems) {
        if (!client) {
          // If Supabase is not configured or in local offline mode, mark as locally acknowledged
          await localDb.outbox.update(item.id, {
            status: 'synced',
            lastAttemptAt: new Date().toISOString(),
          });
          syncedCount++;
          continue;
        }

        try {
          // Attempt sync to Supabase table
          const tableName = item.entity === 'sale' ? 'sales' : item.entity === 'product' ? 'products' : item.entity === 'customer' ? 'customers' : 'audit_events';
          
          if (item.action === 'insert') {
            const { error } = await client.from(tableName).upsert(item.payload);
            if (error) throw error;
          } else if (item.action === 'update') {
            const { error } = await client.from(tableName).upsert(item.payload);
            if (error) throw error;
          }

          await localDb.outbox.update(item.id, {
            status: 'synced',
            lastAttemptAt: new Date().toISOString(),
          });
          syncedCount++;
        } catch (itemErr: any) {
          console.warn(`Sync failed for item ${item.id}:`, itemErr);
          await localDb.outbox.update(item.id, {
            status: 'failed',
            retryCount: item.retryCount + 1,
            lastAttemptAt: new Date().toISOString(),
            error: itemErr?.message || 'Failed to sync with Supabase',
          });
        }
      }

      this.lastSyncAt = new Date().toISOString();
      this.lastError = null;
      return { success: true, syncedCount };
    } catch (err: any) {
      this.lastError = err?.message || 'Sync encountered an error';
      return { success: false, syncedCount: 0, error: this.lastError || undefined };
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }
}

export const syncService = new SyncService();
