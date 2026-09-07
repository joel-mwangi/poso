import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment credentials provided by Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseConnectionInfo(): {
  configured: boolean;
  url: string;
  projectRef: string;
} {
  let projectRef = '';
  try {
    if (supabaseUrl) {
      const parsed = new URL(supabaseUrl);
      projectRef = parsed.hostname.split('.')[0] || '';
    }
  } catch {
    // ignore URL parse errors
  }

  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl,
    projectRef,
  };
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  latencyMs?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      error: 'Supabase URL or Publishable key not provided in environment',
    };
  }

  const start = performance.now();
  try {
    // Lightweight ping to products table or auth session check
    const { error } = await client.from('products').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // If table requires auth or RLS blocks anon, client is still successfully connected to postgres
      if (error.message && !error.message.includes('FetchError') && !error.message.includes('Failed to fetch')) {
        return { connected: true, latencyMs };
      }
      return { connected: false, error: error.message };
    }

    return { connected: true, latencyMs };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Network unreachable' };
  }
}
