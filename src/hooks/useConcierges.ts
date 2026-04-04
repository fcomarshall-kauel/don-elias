'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Concierge {
  id: string;
  name: string;
  phone?: string;
  isActive: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Concierge {
  return { id: row.id, name: row.name, phone: row.phone ?? undefined, isActive: row.is_active };
}

export function useConcierges() {
  const [concierges, setConcierges] = useState<Concierge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('concierges').select('*').order('name').then(({ data }) => {
      if (data) setConcierges(data.map(fromRow));
      setLoading(false);
    });
  }, []);

  const activeConcierges = concierges.filter(c => c.isActive);
  const activeNames = activeConcierges.map(c => c.name);

  const addConcierge = async (data: { name: string; phone?: string }) => {
    const id = crypto.randomUUID();
    setConcierges(prev => [...prev, { id, ...data, isActive: true }]);
    await supabase.from('concierges').insert({ id, name: data.name, phone: data.phone, is_active: true });
  };

  const updateConcierge = async (id: string, data: Partial<Concierge>) => {
    setConcierges(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.phone !== undefined) row.phone = data.phone;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    await supabase.from('concierges').update(row).eq('id', id);
  };

  const deleteConcierge = async (id: string) => {
    setConcierges(prev => prev.filter(c => c.id !== id));
    await supabase.from('concierges').delete().eq('id', id);
  };

  return { concierges, activeConcierges, activeNames, loading, addConcierge, updateConcierge, deleteConcierge };
}
