import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index';
import {
  products,
  customers,
  sales,
  saleItems,
  deniTransactions,
  inventoryMovements,
  syncJournal,
} from './src/db/schema';
import { getOrCreateUser } from './src/db/users';
import { requireAuth, AuthRequest } from './src/middleware/auth';
import { eq, desc, sql } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health endpoint
  app.get('/api/health', async (_req, res) => {
    try {
      const startTime = Date.now();
      const testQueryResult = await db.execute(sql`SELECT 1 as alive`);
      const latencyMs = Date.now() - startTime;
      res.json({
        status: 'ok',
        database: 'cloudsql-postgresql',
        region: 'europe-west3',
        connected: true,
        latencyMs,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Database health check error:', error);
      res.status(500).json({ status: 'error', connected: false, message: error.message });
    }
  });

  // Seed default products to PostgreSQL if empty
  app.post('/api/database/seed-defaults', async (_req, res) => {
    try {
      const existing = await db.select().from(products).limit(1);
      if (existing.length === 0) {
        const defaultItems = [
          {
            productId: 'prod_unga_2kg',
            storeId: 'store_main',
            name: 'Jogoo Maize Meal (Unga) 2kg',
            category: 'Food & Grains',
            unit: 'packet',
            sellingPrice: '190.00',
            costPrice: '165.00',
            stockQuantity: '48.00',
            lowStockThreshold: '10.00',
            barcode: '616110001001',
          },
          {
            productId: 'prod_sugar_1kg',
            storeId: 'store_main',
            name: 'Mumias Sugar 1kg',
            category: 'Food & Grains',
            unit: 'kg',
            sellingPrice: '160.00',
            costPrice: '140.00',
            stockQuantity: '35.00',
            lowStockThreshold: '8.00',
            barcode: '616110001002',
          },
          {
            productId: 'prod_cooking_oil_1l',
            storeId: 'store_main',
            name: 'Rina Salad Cooking Oil 1L',
            category: 'Oils & Fats',
            unit: 'ltr',
            sellingPrice: '280.00',
            costPrice: '245.00',
            stockQuantity: '22.00',
            lowStockThreshold: '5.00',
            barcode: '616110001003',
          },
          {
            productId: 'prod_milk_500ml',
            storeId: 'store_main',
            name: 'Brookside Fresh Milk 500ml',
            category: 'Dairy',
            unit: 'packet',
            sellingPrice: '65.00',
            costPrice: '54.00',
            stockQuantity: '30.00',
            lowStockThreshold: '6.00',
            barcode: '616110001004',
          },
        ];

        for (const item of defaultItems) {
          await db.insert(products).values(item).onConflictDoNothing();
        }
      }
      const all = await db.select().from(products);
      res.json({ success: true, count: all.length, products: all });
    } catch (error: any) {
      console.error('Seed error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Current User Sync / Registration
  app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'user@dukaflow.co.ke';
      const name = req.body.name || req.user!.name || 'Shop Manager';
      const user = await getOrCreateUser(uid, email, name);
      res.json({ user });
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // Products API
  app.get('/api/products', async (req, res) => {
    try {
      const items = await db.select().from(products).orderBy(products.name);
      res.json(items);
    } catch (error: any) {
      console.error('Failed to query products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Outbox Sync Ingest (Cloud SQL Sync Endpoint)
  app.post('/api/sync/ingest', async (req, res) => {
    try {
      const operations: any[] = req.body.operations || [];
      const results: any[] = [];

      for (const op of operations) {
        try {
          // Idempotent insertion into sync journal
          await db
            .insert(syncJournal)
            .values({
              operationId: op.operationId || `op_${Date.now()}`,
              idempotencyKey: op.idempotencyKey || `idemp_${Date.now()}_${Math.random()}`,
              entity: op.entity || 'sale',
              action: op.action || 'create',
              storeId: op.storeId || 'store_main',
              actorUid: op.actorUid || 'system',
              payload: op.payload || {},
            })
            .onConflictDoNothing();

          // Apply entity projections based on action
          if (op.entity === 'sale' && op.action === 'create' && op.payload) {
            const saleData = op.payload;
            await db
              .insert(sales)
              .values({
                saleId: saleData.id,
                storeId: saleData.storeId || 'store_main',
                cashierUid: saleData.cashierId || 'cashier',
                cashierName: saleData.cashierName || 'Cashier',
                totalAmount: String(saleData.totalAmount || 0),
                paymentMethod: saleData.paymentMethod || 'cash',
                paymentStatus: saleData.paymentStatus || 'completed',
                customerId: saleData.customerId || null,
                receiptNumber: saleData.receiptNumber || `DF-${Date.now()}`,
                notes: saleData.notes || null,
              })
              .onConflictDoNothing();

            // Insert line items if present
            if (Array.isArray(saleData.items)) {
              for (const item of saleData.items) {
                await db
                  .insert(saleItems)
                  .values({
                    saleId: saleData.id,
                    productId: item.productId,
                    productName: item.productName || 'Product',
                    quantity: String(item.quantity || 1),
                    unitPrice: String(item.unitPrice || 0),
                    costPrice: String(item.costPrice || 0),
                    subtotal: String(item.subtotal || item.unitPrice * item.quantity),
                  });
              }
            }
          }

          if (op.entity === 'customer' && op.payload) {
            const cust = op.payload;
            await db
              .insert(customers)
              .values({
                customerId: cust.id,
                storeId: cust.storeId || 'store_main',
                name: cust.name,
                phone: cust.phone || null,
                creditLimit: String(cust.creditLimit || 5000),
                currentDeni: String(cust.currentDeni || 0),
                notes: cust.notes || null,
              })
              .onConflictDoUpdate({
                target: customers.customerId,
                set: {
                  currentDeni: String(cust.currentDeni || 0),
                  updatedAt: new Date(),
                },
              });
          }

          results.push({
            operationId: op.operationId,
            status: 'accepted',
            retryable: false,
          });
        } catch (opError: any) {
          console.error(`Error processing operation ${op.operationId}:`, opError);
          results.push({
            operationId: op.operationId,
            status: 'conflict',
            userMessage: opError.message,
            retryable: true,
          });
        }
      }

      res.json({
        success: true,
        processed: results.length,
        results,
      });
    } catch (error: any) {
      console.error('Sync ingest failure:', error);
      res.status(500).json({ error: error.message || 'Sync ingestion error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DukaFlow Server running on http://localhost:${PORT} with Cloud SQL PostgreSQL`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
