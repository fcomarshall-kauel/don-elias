'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Package, PackageType } from '@/types';

// ─── Row mapping ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Package {
  return {
    id: row.id,
    recipientApt: row.recipient_apt,
    type: row.type as PackageType,
    provider: row.provider ?? undefined,
    note: row.note ?? undefined,
    receivedAt: row.received_at,
    receivedBy: row.received_by,
    deliveredAt: row.delivered_at ?? undefined,
    deliveredTo: row.delivered_to ?? undefined,
    status: row.status,
    notifiedAt: row.notified_at ?? undefined,
  };
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    supabase
      .from('packages')
      .select('*')
      .order('received_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPackages(data.map(fromRow));
      });

    // Realtime: update when packages change (for Lobby TV and multi-device)
    const channel = supabase
      .channel('packages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'packages' },
        (payload) => {
          const pkg = fromRow(payload.new);
          setPackages(prev => prev.some(p => p.id === pkg.id) ? prev : [pkg, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'packages' },
        (payload) => {
          const updated = fromRow(payload.new);
          setPackages(prev => prev.map(p => p.id === updated.id ? updated : p));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const pendingPackages = useMemo(
    () => packages.filter(p => p.status === 'pending'),
    [packages]
  );

  const deliveredPackages = useMemo(
    () => packages
      .filter(p => p.status === 'delivered')
      .sort((a, b) => new Date(b.deliveredAt!).getTime() - new Date(a.deliveredAt!).getTime()),
    [packages]
  );

  const packagesByUnit = useMemo(
    () => pendingPackages.reduce<Record<string, Package[]>>((acc, pkg) => {
      if (!acc[pkg.recipientApt]) acc[pkg.recipientApt] = [];
      acc[pkg.recipientApt].push(pkg);
      return acc;
    }, {}),
    [pendingPackages]
  );

  const addPackage = (data: { recipientApt: string; type: PackageType; provider?: string; note?: string; receivedBy: string }): string => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Optimistic update
    const newPkg: Package = { id, ...data, receivedAt: now, status: 'pending' };
    setPackages(prev => [newPkg, ...prev]);

    // Persist to Supabase
    supabase.from('packages').insert({
      id,
      recipient_apt: data.recipientApt,
      type: data.type,
      provider: data.provider,
      note: data.note,
      received_at: now,
      received_by: data.receivedBy,
      status: 'pending',
    }).then();

    return id;
  };

  const markDelivered = (ids: string | string[], deliveredTo?: string) => {
    const now = new Date().toISOString();
    const idArray = Array.isArray(ids) ? ids : [ids];
    const idSet = new Set(idArray);
    setPackages(prev =>
      prev.map(p => idSet.has(p.id) ? { ...p, status: 'delivered' as const, deliveredAt: now, deliveredTo } : p)
    );
    supabase.from('packages').update({
      status: 'delivered',
      delivered_at: now,
      delivered_to: deliveredTo,
    }).in('id', idArray).then();
  };

  const markNotified = (id: string) => {
    const now = new Date().toISOString();
    setPackages(prev =>
      prev.map(p => p.id === id ? { ...p, notifiedAt: now } : p)
    );
    supabase.from('packages').update({ notified_at: now }).eq('id', id).then();
  };

  return { packages, pendingPackages, deliveredPackages, packagesByUnit, addPackage, markDelivered, markNotified };
}
