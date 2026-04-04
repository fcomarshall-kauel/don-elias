'use client';
import { useState, useEffect, useCallback } from 'react';

// Tracks when the concierge last viewed each apt's conversation.
// Stored in localStorage — per-device, no need to sync.

const STORAGE_KEY = 'porter_msg_seen';

type SeenMap = Record<string, string>; // apt → ISO timestamp

export function useSeenMessages() {
  const [seenMap, setSeenMap] = useState<SeenMap>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSeenMap(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const markSeen = useCallback((apt: string) => {
    const now = new Date().toISOString();
    setSeenMap(prev => {
      const next = { ...prev, [apt]: now };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const getLastSeen = useCallback((apt: string): string | null => {
    return seenMap[apt] ?? null;
  }, [seenMap]);

  const hasUnseenCustomMessage = useCallback((
    apt: string,
    messages: Array<{ direction?: string; text: string; sentAt: string }>
  ): boolean => {
    const lastSeen = seenMap[apt];

    // Find incoming custom messages (not quick replies)
    const customIncoming = messages.filter(m => {
      if (m.direction !== 'incoming') return false;
      const isQuick = m.text === 'Ya bajo' || m.text === 'Más tarde' || m.text === 'Mas tarde';
      if (isQuick) return false;
      if (lastSeen && new Date(m.sentAt) <= new Date(lastSeen)) return false;
      return true;
    });

    return customIncoming.length > 0;
  }, [seenMap]);

  return { seenMap, markSeen, getLastSeen, hasUnseenCustomMessage };
}
