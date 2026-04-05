'use client';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDataContext } from '@/providers/DataProvider';
import { ParkingSpot } from '@/types';

export function useParkingSpots() {
  const { parkingSpots, setParkingSpots, visits, loaded } = useDataContext();

  const activeSpots = useMemo(() => parkingSpots.filter(s => s.isActive), [parkingSpots]);

  // Which spots are currently occupied by active visits
  const occupiedSpots = useMemo(() => {
    const activeVisits = visits.filter(v => v.status === 'active' && v.parkingSpot);
    return new Set(activeVisits.map(v => v.parkingSpot!));
  }, [visits]);

  const availableSpots = useMemo(
    () => activeSpots.filter(s => !occupiedSpots.has(s.name)),
    [activeSpots, occupiedSpots]
  );

  const isOccupied = (spotName: string) => occupiedSpots.has(spotName);

  const addSpot = async (data: { name: string; spotType?: ParkingSpot['spotType'] }) => {
    const id = crypto.randomUUID();
    const maxOrder = parkingSpots.length;
    const newSpot: ParkingSpot = { id, name: data.name, spotType: data.spotType ?? 'visita', isActive: true, sortOrder: maxOrder + 1 };
    setParkingSpots(prev => [...prev, newSpot]);
    await supabase.from('parking_spots').insert({ id, name: data.name, spot_type: data.spotType ?? 'visita', is_active: true, sort_order: maxOrder + 1 });
  };

  const updateSpot = async (id: string, data: Partial<ParkingSpot>) => {
    setParkingSpots(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
    await supabase.from('parking_spots').update(row).eq('id', id);
  };

  const deleteSpot = async (id: string) => {
    setParkingSpots(prev => prev.filter(s => s.id !== id));
    await supabase.from('parking_spots').delete().eq('id', id);
  };

  return { parkingSpots, activeSpots, availableSpots, occupiedSpots, isOccupied, loading: !loaded, addSpot, updateSpot, deleteSpot };
}
