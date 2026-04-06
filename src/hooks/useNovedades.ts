'use client';
import { useMemo } from 'react';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';
import { Novedad, NovedadCategory } from '@/types';

export function useNovedades() {
  const { novedades, setNovedades } = useDataContext();

  const recentNovedades = useMemo(
    () => [...novedades].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [novedades]
  );

  const addNovedad = (data: { text: string; category: NovedadCategory; author: string }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newNovedad: Novedad = { id, ...data, createdAt: now, isHandoverEntry: false };
    const updated = [newNovedad, ...novedades];
    setNovedades(updated);
    saveToCache('novedades', updated);
    syncMutation('novedades', 'insert', {
      id, text: data.text, category: data.category, author: data.author,
      created_at: now, is_handover_entry: false,
    });
  };

  const addHandoverEntry = (text: string, author: string) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const entry: Novedad = { id, text, category: 'informativo', createdAt: now, author, isHandoverEntry: true };
    const updated = [entry, ...novedades];
    setNovedades(updated);
    saveToCache('novedades', updated);
    syncMutation('novedades', 'insert', {
      id, text, category: 'informativo', author, created_at: now, is_handover_entry: true,
    });
  };

  return { novedades, recentNovedades, addNovedad, addHandoverEntry };
}
