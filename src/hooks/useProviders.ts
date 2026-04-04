'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PackageType } from '@/types';

export interface Provider {
  id: string;
  name: string;
  packageType: PackageType;
  isActive: boolean;
  sortOrder: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Provider {
  return { id: row.id, name: row.name, packageType: row.package_type, isActive: row.is_active, sortOrder: row.sort_order ?? 0 };
}

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('providers').select('*').order('sort_order').then(({ data }) => {
      if (data) setProviders(data.map(fromRow));
      setLoading(false);
    });
  }, []);

  const getByType = useCallback(
    (type: PackageType) => providers.filter(p => p.packageType === type && p.isActive).map(p => p.name),
    [providers]
  );

  const addProvider = async (data: { name: string; packageType: PackageType }) => {
    const id = crypto.randomUUID();
    const maxOrder = providers.filter(p => p.packageType === data.packageType).length;
    const newP: Provider = { id, ...data, isActive: true, sortOrder: maxOrder + 1 };
    setProviders(prev => [...prev, newP]);
    await supabase.from('providers').insert({ id, name: data.name, package_type: data.packageType, is_active: true, sort_order: maxOrder + 1 });
  };

  const updateProvider = async (id: string, data: Partial<Provider>) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
    await supabase.from('providers').update(row).eq('id', id);
  };

  const deleteProvider = async (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    await supabase.from('providers').delete().eq('id', id);
  };

  return { providers, loading, getByType, addProvider, updateProvider, deleteProvider };
}
