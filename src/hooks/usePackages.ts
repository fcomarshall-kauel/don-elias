'use client';
import { useMemo } from 'react';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';
import { Package, PackageType } from '@/types';

export function usePackages() {
  const { packages, setPackages } = useDataContext();

  const pendingPackages = useMemo(() => packages.filter(p => p.status === 'pending'), [packages]);
  const deliveredPackages = useMemo(
    () => packages.filter(p => p.status === 'delivered')
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
    const newPkg: Package = { id, ...data, receivedAt: now, status: 'pending' };
    const updated = [newPkg, ...packages];
    setPackages(updated);
    saveToCache('packages', updated);
    syncMutation('packages', 'insert', {
      id, recipient_apt: data.recipientApt, type: data.type, provider: data.provider,
      note: data.note, received_at: now, received_by: data.receivedBy, status: 'pending',
    });
    return id;
  };

  const markDelivered = (ids: string | string[], deliveredTo?: string) => {
    const now = new Date().toISOString();
    const idArray = Array.isArray(ids) ? ids : [ids];
    const idSet = new Set(idArray);
    const updated = packages.map(p => idSet.has(p.id) ? { ...p, status: 'delivered' as const, deliveredAt: now, deliveredTo } : p);
    setPackages(updated);
    saveToCache('packages', updated);
    syncMutation('packages', 'update',
      { status: 'delivered', delivered_at: now, delivered_to: deliveredTo },
      { column: 'id', op: 'in', value: idArray }
    );
  };

  const markNotified = (id: string) => {
    const now = new Date().toISOString();
    const updated = packages.map(p => p.id === id ? { ...p, notifiedAt: now } : p);
    setPackages(updated);
    saveToCache('packages', updated);
    syncMutation('packages', 'update', { notified_at: now }, { column: 'id', op: 'eq', value: id });
  };

  return { packages, pendingPackages, deliveredPackages, packagesByUnit, addPackage, markDelivered, markNotified };
}
