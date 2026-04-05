'use client';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDataContext } from '@/providers/DataProvider';
import { Visit, VisitType } from '@/types';

export function useVisits() {
  const { visits, setVisits } = useDataContext();

  const activeVisits = useMemo(() => visits.filter(v => v.status === 'active'), [visits]);
  const recentVisits = useMemo(
    () => visits.filter(v => v.status === 'checked-out')
      .sort((a, b) => new Date(b.checkedOutAt!).getTime() - new Date(a.checkedOutAt!).getTime())
      .slice(0, 20),
    [visits]
  );

  const addVisit = (data: { visitorName: string; destinationApt: string; type: VisitType; companyOrWorkType?: string; vehiclePlate?: string; parkingSpot?: string }) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newVisit: Visit = { id, ...data, checkedInAt: now, status: 'active' };
    setVisits(prev => [newVisit, ...prev]);
    supabase.from('visits').insert({
      id, visitor_name: data.visitorName, destination_apt: data.destinationApt,
      type: data.type, company_or_work_type: data.companyOrWorkType,
      vehicle_plate: data.vehiclePlate, parking_spot: data.parkingSpot,
      checked_in_at: now, status: 'active',
    }).then();
  };

  const checkOut = (id: string) => {
    const now = new Date().toISOString();
    setVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'checked-out' as const, checkedOutAt: now } : v));
    supabase.from('visits').update({ status: 'checked-out', checked_out_at: now }).eq('id', id).then();
  };

  return { visits, activeVisits, recentVisits, addVisit, checkOut };
}
