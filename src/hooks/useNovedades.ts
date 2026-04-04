'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Novedad, NovedadCategory } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Novedad {
  return {
    id: row.id,
    text: row.text,
    category: row.category as NovedadCategory,
    createdAt: row.created_at,
    author: row.author,
    isHandoverEntry: row.is_handover_entry,
  };
}

export function useNovedades() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);

  useEffect(() => {
    supabase
      .from('novedades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setNovedades(data.map(fromRow));
      });
  }, []);

  const recentNovedades = useMemo(
    () => [...novedades].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [novedades]
  );

  const addNovedad = (data: { text: string; category: NovedadCategory; author: string }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newNovedad: Novedad = { id, ...data, createdAt: now, isHandoverEntry: false };
    setNovedades(prev => [newNovedad, ...prev]);

    supabase.from('novedades').insert({
      id,
      text: data.text,
      category: data.category,
      author: data.author,
      created_at: now,
      is_handover_entry: false,
    }).then();
  };

  const addHandoverEntry = (text: string, author: string) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const entry: Novedad = { id, text, category: 'informativo', createdAt: now, author, isHandoverEntry: true };
    setNovedades(prev => [entry, ...prev]);

    supabase.from('novedades').insert({
      id,
      text,
      category: 'informativo',
      author,
      created_at: now,
      is_handover_entry: true,
    }).then();
  };

  return { novedades, recentNovedades, addNovedad, addHandoverEntry };
}
