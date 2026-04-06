'use client';
import { useCallback } from 'react';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';
import { PackageType } from '@/types';

export interface Provider {
  id: string;
  name: string;
  packageType: PackageType;
  isActive: boolean;
  sortOrder: number;
}

export function useProviders() {
  const { providers, setProviders, loaded } = useDataContext();

  const getByType = useCallback(
    (type: PackageType) => providers.filter(p => p.packageType === type && p.isActive).map(p => p.name),
    [providers]
  );

  const addProvider = async (data: { name: string; packageType: PackageType }) => {
    const id = crypto.randomUUID();
    const maxOrder = providers.filter(p => p.packageType === data.packageType).length;
    const updated = [...providers, { id, ...data, isActive: true, sortOrder: maxOrder + 1 }];
    setProviders(updated);
    saveToCache('providers', updated);
    syncMutation('providers', 'insert', { id, name: data.name, package_type: data.packageType, is_active: true, sort_order: maxOrder + 1 });
  };

  const updateProvider = async (id: string, data: Partial<Provider>) => {
    const updated = providers.map(p => p.id === id ? { ...p, ...data } : p);
    setProviders(updated);
    saveToCache('providers', updated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
    syncMutation('providers', 'update', row, { column: 'id', op: 'eq', value: id });
  };

  const deleteProvider = async (id: string) => {
    const updated = providers.filter(p => p.id !== id);
    setProviders(updated);
    saveToCache('providers', updated);
    syncMutation('providers', 'delete', {}, { column: 'id', op: 'eq', value: id });
  };

  return { providers, loading: !loaded, getByType, addProvider, updateProvider, deleteProvider };
}
