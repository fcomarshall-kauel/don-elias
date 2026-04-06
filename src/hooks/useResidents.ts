'use client';
import { useCallback } from 'react';
import { useDataContext } from '@/providers/DataProvider';
import { syncMutation, saveToCache } from '@/lib/offlineStore';

export type ContactMethod = 'whatsapp' | 'citofono' | 'llamada' | 'ninguno';

export interface Resident {
  id: string;
  apt: string;
  name: string;
  tower?: string;
  phone?: string;
  contactPreference: ContactMethod;
  contactForPackages: ContactMethod;
  contactForVisits: ContactMethod;
  isNana: boolean;
  isFrequentVisitor: boolean;
  nanaName?: string;
  nanaPhone?: string;
  schedule?: string;
  notes?: string;
}

export function useResidents() {
  const { residents, setResidents, loaded } = useDataContext();

  const getByApt = useCallback((apt: string) => residents.filter(r => r.apt === apt && !r.isNana && !r.isFrequentVisitor), [residents]);
  const getNanasByApt = useCallback((apt: string) => residents.filter(r => r.apt === apt && r.isNana), [residents]);
  const getFrequentVisitorsByApt = useCallback((apt: string) => residents.filter(r => r.apt === apt && r.isFrequentVisitor), [residents]);
  const getPhonesByApt = useCallback((apt: string) => {
    const phones = residents.filter(r => r.apt === apt && r.phone).map(r => r.phone!);
    return [...new Set(phones)];
  }, [residents]);
  const getAptByPhone = useCallback((phone: string) => {
    const normalized = phone.replace(/[+\s]/g, '');
    const r = residents.find(res => res.phone === normalized);
    return r?.apt ?? null;
  }, [residents]);
  const getAllApts = useCallback(() => [...new Set(residents.map(r => r.apt))].sort((a, b) => Number(a) - Number(b)), [residents]);

  const addResident = async (data: Omit<Resident, 'id'>) => {
    const id = crypto.randomUUID();
    const updated = [...residents, { ...data, id }];
    setResidents(updated);
    saveToCache('residents', updated);
    syncMutation('residents', 'insert', {
      id, apt: data.apt, name: data.name, tower: data.tower, phone: data.phone,
      contact_preference: data.contactPreference,
      contact_for_packages: data.contactForPackages,
      contact_for_visits: data.contactForVisits,
      is_nana: data.isNana, is_frequent_visitor: data.isFrequentVisitor,
      nana_name: data.nanaName, nana_phone: data.nanaPhone,
      schedule: data.schedule, notes: data.notes,
    });
    return id;
  };

  const updateResident = async (id: string, data: Partial<Resident>) => {
    const updated = residents.map(r => r.id === id ? { ...r, ...data } : r);
    setResidents(updated);
    saveToCache('residents', updated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: any = {};
    if (data.name !== undefined) row.name = data.name;
    if (data.apt !== undefined) row.apt = data.apt;
    if (data.tower !== undefined) row.tower = data.tower;
    if (data.phone !== undefined) row.phone = data.phone;
    if (data.contactPreference !== undefined) row.contact_preference = data.contactPreference;
    if (data.contactForPackages !== undefined) row.contact_for_packages = data.contactForPackages;
    if (data.contactForVisits !== undefined) row.contact_for_visits = data.contactForVisits;
    if (data.isNana !== undefined) row.is_nana = data.isNana;
    if (data.isFrequentVisitor !== undefined) row.is_frequent_visitor = data.isFrequentVisitor;
    if (data.nanaName !== undefined) row.nana_name = data.nanaName;
    if (data.nanaPhone !== undefined) row.nana_phone = data.nanaPhone;
    if (data.schedule !== undefined) row.schedule = data.schedule;
    if (data.notes !== undefined) row.notes = data.notes;
    syncMutation('residents', 'update', row, { column: 'id', op: 'eq', value: id });
  };

  const deleteResident = async (id: string) => {
    const updated = residents.filter(r => r.id !== id);
    setResidents(updated);
    saveToCache('residents', updated);
    syncMutation('residents', 'delete', {}, { column: 'id', op: 'eq', value: id });
  };

  return { residents, loading: !loaded, getByApt, getNanasByApt, getFrequentVisitorsByApt, getPhonesByApt, getAptByPhone, getAllApts, addResident, updateResident, deleteResident };
}
