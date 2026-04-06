'use client';
import { useState, useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline, pendingCount, syncing, lastSyncResult } = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Remove the static HTML banner (from layout.tsx script) once React takes over
    const staticBanner = document.getElementById('offline-banner-static');
    if (staticBanner) staticBanner.remove();
  }, []);

  // Don't render anything until mounted on client (avoids hydration mismatch)
  if (!mounted) return null;

  // Show nothing if online and no pending or sync results
  if (isOnline && pendingCount === 0 && !lastSyncResult) return null;

  // Sync success message (brief)
  if (isOnline && lastSyncResult && lastSyncResult.processed > 0) {
    return (
      <div className="bg-green-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-[slideIn_0.3s_ease-out]">
        <CheckCircle className="w-4 h-4" />
        {lastSyncResult.processed} cambio{lastSyncResult.processed !== 1 ? 's' : ''} sincronizado{lastSyncResult.processed !== 1 ? 's' : ''}
      </div>
    );
  }

  // Online but pending sync
  if (isOnline && pendingCount > 0) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Sincronizando...' : `${pendingCount} cambio${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''}`}
      </div>
    );
  }

  // Offline
  if (!isOnline) {
    return (
      <div className="bg-slate-700 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        Sin conexion — modo offline. Por favor verifique conexion WiFi.
        {pendingCount > 0 && (
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-1">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  return null;
}
