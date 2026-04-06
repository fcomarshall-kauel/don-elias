// ─── Offline Store ──────────────────────────────────────────────────────
// localStorage-based cache + sync queue for offline-first operation.
//
// Cache: mirrors the DataProvider state in localStorage so the app
// can boot instantly (even without internet) using cached data.
//
// SyncQueue: stores pending Supabase mutations that failed due to
// connectivity issues. Processed automatically when back online.

import { supabase } from '@/lib/supabase/client';

// ─── Cache ──────────────────────────────────────────────────────────────

const CACHE_PREFIX = 'offline_';

export function saveToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Sync Queue ─────────────────────────────────────────────────────────

const QUEUE_KEY = 'offline_sync_queue';

export interface SyncOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  data: Record<string, unknown>;
  filter?: { column: string; op: 'eq' | 'in'; value: unknown };
  createdAt: string;
}

export function getSyncQueue(): SyncOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncOperation[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

export function addToSyncQueue(op: Omit<SyncOperation, 'id' | 'createdAt'>): void {
  const queue = getSyncQueue();
  const newOp = { ...op, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  queue.push(newOp);
  saveSyncQueue(queue);
  console.log(`[Offline Queue] +1 ${op.operation} → ${op.table} (${queue.length} pendientes)`, op.data);
}

export function getSyncQueueCount(): number {
  return getSyncQueue().length;
}

// ─── Process Sync Queue ─────────────────────────────────────────────────
// Attempts to replay all pending operations against Supabase.
// Returns the number of successfully processed operations.

export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  const queue = getSyncQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;
  const remaining: SyncOperation[] = [];

  console.log(`[Offline Sync] Procesando ${queue.length} operaciones pendientes...`);

  for (const op of queue) {
    try {
      // Special handler: queued WhatsApp sends
      if (op.table === '_whatsapp_send') {
        try {
          const res = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.data),
          });
          if (res.ok) {
            processed++;
          } else {
            remaining.push(op);
            failed++;
          }
        } catch {
          remaining.push(op);
          failed++;
        }
        continue;
      }

      let result;

      if (op.operation === 'insert') {
        result = await supabase.from(op.table).insert(op.data);
      } else if (op.operation === 'update' && op.filter) {
        let query = supabase.from(op.table).update(op.data);
        if (op.filter.op === 'eq') {
          query = query.eq(op.filter.column, op.filter.value as string);
        } else if (op.filter.op === 'in') {
          query = query.in(op.filter.column, op.filter.value as string[]);
        }
        result = await query;
      } else if (op.operation === 'delete' && op.filter) {
        let query = supabase.from(op.table).delete();
        if (op.filter.op === 'eq') {
          query = query.eq(op.filter.column, op.filter.value as string);
        }
        result = await query;
      } else if (op.operation === 'upsert') {
        result = await supabase.from(op.table).upsert(op.data);
      }

      if (result?.error) {
        // Supabase returned an error — might be a conflict (duplicate ID)
        // If it's a duplicate, consider it processed (data already there)
        if (result.error.code === '23505') {
          // Unique violation — data already exists, skip
          processed++;
        } else {
          remaining.push(op);
          failed++;
        }
      } else {
        processed++;
      }
    } catch {
      // Network error — keep in queue for next attempt
      remaining.push(op);
      failed++;
    }
  }

  saveSyncQueue(remaining);
  console.log(`[Offline Sync] Resultado: ${processed} procesados, ${failed} fallidos, ${remaining.length} restantes`);
  return { processed, failed };
}

// ─── Helper: Supabase mutation with offline fallback ────────────────────
// Wraps a Supabase mutation — if it fails, queues it for later sync.

export function syncMutation(
  table: string,
  operation: SyncOperation['operation'],
  data: Record<string, unknown>,
  filter?: SyncOperation['filter'],
): void {
  const doMutation = async () => {
    let result;

    if (operation === 'insert') {
      result = await supabase.from(table).insert(data);
    } else if (operation === 'update' && filter) {
      let query = supabase.from(table).update(data);
      if (filter.op === 'eq') query = query.eq(filter.column, filter.value as string);
      else if (filter.op === 'in') query = query.in(filter.column, filter.value as string[]);
      result = await query;
    } else if (operation === 'delete' && filter) {
      let query = supabase.from(table).delete();
      if (filter.op === 'eq') query = query.eq(filter.column, filter.value as string);
      result = await query;
    } else if (operation === 'upsert') {
      result = await supabase.from(table).upsert(data);
    }

    if (result?.error) {
      throw new Error(result.error.message);
    }
  };

  doMutation().catch(() => {
    addToSyncQueue({ table, operation, data, filter });
  });
}
