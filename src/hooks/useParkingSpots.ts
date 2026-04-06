'use client';
import { useMemo } from 'react';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';
import { ParkingSpot } from '@/types';

export function useParkingSpots() {
  const { parkingSpots, setParkingSpots, visits, loaded } = useDataContext();

  const activeSpots = useMemo(() => parkingSpots.filter(s => s.isActive), [parkingSpots]);

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
    const updated = [...parkingSpots, newSpot];
    setParkingSpots(updated);
    saveToCache('parkingSpots', updated);
    syncMutation('parking_spots', 'insert', { id, name: data.name, spot_type: data.spotType ?? 'visita', is_active: true, sort_order: maxOrder + 1 });
  };

  const updateSpot = async (id: string, data: Partial<ParkingSpot>) => {
    const updated = parkingSpots.map(s => s.id === id ? { ...s, ...data } : s);
    setParkingSpots(updated);
    saveToCache('parkingSpots', updated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
    syncMutation('parking_spots', 'update', row, { column: 'id', op: 'eq', value: id });
  };

  const deleteSpot = async (id: string) => {
    const updated = parkingSpots.filter(s => s.id !== id);
    setParkingSpots(updated);
    saveToCache('parkingSpots', updated);
    syncMutation('parking_spots', 'delete', {}, { column: 'id', op: 'eq', value: id });
  };

  return { parkingSpots, activeSpots, availableSpots, occupiedSpots, isOccupied, loading: !loaded, addSpot, updateSpot, deleteSpot };
}
