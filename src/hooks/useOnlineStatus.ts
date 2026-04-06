'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { processSyncQueue, getSyncQueueCount } from '@/lib/offlineStore';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ processed: number; failed: number } | null>(null);
  const syncingRef = useRef(false);

  // Initialize — read true online status after mount (avoids hydration mismatch)
  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);
    setPendingCount(getSyncQueueCount());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const doSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const result = await processSyncQueue();
      const remaining = getSyncQueueCount();
      setPendingCount(remaining);

      if (result.processed > 0) {
        setLastSyncResult(result);
        setTimeout(() => setLastSyncResult(null), 3000);
      }

      // If there are still pending items and we're online, retry after a delay
      if (remaining > 0 && navigator.onLine) {
        setTimeout(() => {
          syncingRef.current = false;
          setSyncing(false);
          // Will trigger auto-sync via the effect below
          setPendingCount(getSyncQueueCount());
        }, 3000);
        return;
      }
    } catch {
      // Sync failed — will retry
    }
    syncingRef.current = false;
    setSyncing(false);
  }, []);

  // Auto-sync when coming back online or when pending count changes
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncingRef.current) {
      doSync();
    }
  }, [isOnline, pendingCount, doSync]);

  // Periodic check for pending count (catches items added by other hooks)
  useEffect(() => {
    const interval = setInterval(() => {
      const count = getSyncQueueCount();
      setPendingCount(count);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline: mounted ? isOnline : true, pendingCount, syncing, lastSyncResult, doSync };
}
