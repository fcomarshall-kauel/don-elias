'use client';
import { useLocalStorage } from './useLocalStorage';
import { Novedad, NovedadCategory } from '@/types';

export function useNovedades() {
  const [novedades, setNovedades] = useLocalStorage<Novedad[]>('porter_novedades', []);

  const recentNovedades = [...novedades].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const addNovedad = (data: { text: string; category: NovedadCategory; author: string }) => {
    const newNovedad: Novedad = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      isHandoverEntry: false,
    };
    setNovedades(prev => [newNovedad, ...prev]);
  };

  const addHandoverEntry = (text: string, author: string) => {
    const entry: Novedad = {
      id: crypto.randomUUID(),
      text,
      category: 'informativo',
      createdAt: new Date().toISOString(),
      author,
      isHandoverEntry: true,
    };
    setNovedades(prev => [entry, ...prev]);
  };

  return { novedades, recentNovedades, addNovedad, addHandoverEntry };
}
