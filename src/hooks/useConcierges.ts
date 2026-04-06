'use client';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';

export interface Concierge {
  id: string;
  name: string;
  phone?: string;
  isActive: boolean;
}

export function useConcierges() {
  const { concierges, setConcierges, loaded } = useDataContext();

  const activeConcierges = concierges.filter(c => c.isActive);
  const activeNames = activeConcierges.map(c => c.name);

  const addConcierge = async (data: { name: string; phone?: string }) => {
    const id = crypto.randomUUID();
    const updated = [...concierges, { id, ...data, isActive: true }];
    setConcierges(updated);
    saveToCache('concierges', updated);
    syncMutation('concierges', 'insert', { id, name: data.name, phone: data.phone, is_active: true });
  };

  const updateConcierge = async (id: string, data: Partial<Concierge>) => {
    const updated = concierges.map(c => c.id === id ? { ...c, ...data } : c);
    setConcierges(updated);
    saveToCache('concierges', updated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.phone !== undefined) row.phone = data.phone;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    syncMutation('concierges', 'update', row, { column: 'id', op: 'eq', value: id });
  };

  const deleteConcierge = async (id: string) => {
    const updated = concierges.filter(c => c.id !== id);
    setConcierges(updated);
    saveToCache('concierges', updated);
    syncMutation('concierges', 'delete', {}, { column: 'id', op: 'eq', value: id });
  };

  return { concierges, activeConcierges, activeNames, loading: !loaded, addConcierge, updateConcierge, deleteConcierge };
}
