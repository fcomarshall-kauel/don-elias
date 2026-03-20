'use client';
import { useLocalStorage } from './useLocalStorage';
import { Visit, VisitType } from '@/types';

export function useVisits() {
  const [visits, setVisits] = useLocalStorage<Visit[]>('porter_visits', []);

  const activeVisits = visits.filter(v => v.status === 'active');
  const recentVisits = visits
    .filter(v => v.status === 'checked-out')
    .sort((a, b) => new Date(b.checkedOutAt!).getTime() - new Date(a.checkedOutAt!).getTime())
    .slice(0, 20);

  const addVisit = (data: { visitorName: string; destinationApt: string; type: VisitType; companyOrWorkType?: string }) => {
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      ...data,
      checkedInAt: new Date().toISOString(),
      status: 'active',
    };
    setVisits(prev => [newVisit, ...prev]);
  };

  const checkOut = (id: string) => {
    setVisits(prev =>
      prev.map(v =>
        v.id === id ? { ...v, status: 'checked-out', checkedOutAt: new Date().toISOString() } : v
      )
    );
  };

  return { visits, activeVisits, recentVisits, addVisit, checkOut };
}
