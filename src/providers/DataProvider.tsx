'use client';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { loadFromCache, saveToCache } from '@/lib/offlineStore';
import {
  Package, PackageType, WhatsAppMessage, WhatsAppSendResult,
  WaEventType, WaMessageStatus, Visit, VisitType, Novedad, NovedadCategory, AppSettings, ParkingSpot,
} from '@/types';
import { Resident, ContactMethod } from '@/hooks/useResidents';
import { Concierge } from '@/hooks/useConcierges';
import { Provider } from '@/hooks/useProviders';

// ─── Row mappers ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPackage = (r: any): Package => ({
  id: r.id, recipientApt: r.recipient_apt, type: r.type, provider: r.provider ?? undefined,
  note: r.note ?? undefined, receivedAt: r.received_at, receivedBy: r.received_by,
  deliveredAt: r.delivered_at ?? undefined, deliveredTo: r.delivered_to ?? undefined,
  status: r.status, notifiedAt: r.notified_at ?? undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMessage = (r: any): WhatsAppMessage => ({
  id: r.id, apt: r.apt, text: r.text, sentAt: r.sent_at, packageId: r.package_id ?? '',
  eventType: r.event_type, phoneNumber: r.phone_number ?? undefined,
  waMessageId: r.wa_message_id ?? undefined, status: r.status, mock: r.mock ?? undefined,
  direction: r.direction ?? 'outgoing',
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapVisit = (r: any): Visit => ({
  id: r.id, visitorName: r.visitor_name, destinationApt: r.destination_apt,
  type: r.type, companyOrWorkType: r.company_or_work_type ?? undefined,
  checkedInAt: r.checked_in_at, checkedOutAt: r.checked_out_at ?? undefined, status: r.status,
  vehiclePlate: r.vehicle_plate ?? undefined, parkingSpot: r.parking_spot ?? undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapParkingSpot = (r: any): ParkingSpot => ({
  id: r.id, name: r.name, spotType: r.spot_type, isActive: r.is_active, sortOrder: r.sort_order ?? 0,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapNovedad = (r: any): Novedad => ({
  id: r.id, text: r.text, category: r.category, createdAt: r.created_at,
  author: r.author, isHandoverEntry: r.is_handover_entry,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapResident = (r: any): Resident => ({
  id: r.id, apt: r.apt, name: r.name, tower: r.tower ?? undefined,
  phone: r.phone ?? undefined, contactPreference: r.contact_preference ?? 'whatsapp',
  contactForPackages: r.contact_for_packages ?? r.contact_preference ?? 'citofono',
  contactForVisits: r.contact_for_visits ?? 'citofono',
  isNana: r.is_nana ?? false, isFrequentVisitor: r.is_frequent_visitor ?? false,
  nanaName: r.nana_name ?? undefined, nanaPhone: r.nana_phone ?? undefined,
  schedule: r.schedule ?? undefined, notes: r.notes ?? undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapConcierge = (r: any): Concierge => ({
  id: r.id, name: r.name, phone: r.phone ?? undefined, isActive: r.is_active,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProvider = (r: any): Provider => ({
  id: r.id, name: r.name, packageType: r.package_type, isActive: r.is_active, sortOrder: r.sort_order ?? 0,
});

// ─── Context type ───────────────────────────────────────────────────────

interface DataContextType {
  // Raw state
  packages: Package[];
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
  messages: WhatsAppMessage[];
  setMessages: React.Dispatch<React.SetStateAction<WhatsAppMessage[]>>;
  visits: Visit[];
  setVisits: React.Dispatch<React.SetStateAction<Visit[]>>;
  novedades: Novedad[];
  setNovedades: React.Dispatch<React.SetStateAction<Novedad[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
  concierges: Concierge[];
  setConcierges: React.Dispatch<React.SetStateAction<Concierge[]>>;
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  parkingSpots: ParkingSpot[];
  setParkingSpots: React.Dispatch<React.SetStateAction<ParkingSpot[]>>;
  loaded: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within DataProvider');
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = { conciergerName: 'Claudio', buildingName: 'Gran Bretaña' };

export function DataProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [concierges, setConcierges] = useState<Concierge[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Step 1: Load from localStorage cache (instant, works offline)
    const cached = {
      packages: loadFromCache<Package[]>('packages'),
      messages: loadFromCache<WhatsAppMessage[]>('messages'),
      visits: loadFromCache<Visit[]>('visits'),
      novedades: loadFromCache<Novedad[]>('novedades'),
      settings: loadFromCache<AppSettings>('settings'),
      residents: loadFromCache<Resident[]>('residents'),
      concierges: loadFromCache<Concierge[]>('concierges'),
      providers: loadFromCache<Provider[]>('providers'),
      parkingSpots: loadFromCache<ParkingSpot[]>('parkingSpots'),
    };

    const cacheHits = Object.entries(cached).filter(([, v]) => v !== null).map(([k]) => k);
    console.log(`[DataProvider] Cache loaded: ${cacheHits.length}/9 tables`, cacheHits);

    if (cached.packages) setPackages(cached.packages);
    if (cached.messages) setMessages(cached.messages);
    if (cached.visits) setVisits(cached.visits);
    if (cached.novedades) setNovedades(cached.novedades);
    if (cached.settings) setSettings(cached.settings);
    if (cached.residents) setResidents(cached.residents);
    if (cached.concierges) setConcierges(cached.concierges);
    if (cached.providers) setProviders(cached.providers);
    if (cached.parkingSpots) setParkingSpots(cached.parkingSpots);

    // Mark as loaded if we have cached data (app is usable immediately)
    const hasCachedData = !!(cached.packages || cached.settings);
    if (hasCachedData) setLoaded(true);

    // Step 2: Fetch from Supabase in background (update cache)
    Promise.all([
      supabase.from('packages').select('*').order('received_at', { ascending: false }),
      supabase.from('whatsapp_messages').select('*').order('sent_at', { ascending: true }).limit(500),
      supabase.from('visits').select('*').order('checked_in_at', { ascending: false }).limit(100),
      supabase.from('novedades').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('app_settings').select('*').eq('id', 1).single(),
      supabase.from('residents').select('*').order('apt'),
      supabase.from('concierges').select('*').order('name'),
      supabase.from('providers').select('*').order('sort_order'),
      supabase.from('parking_spots').select('*').order('sort_order'),
    ]).then(([pkgRes, msgRes, visitRes, novRes, settRes, resRes, concRes, provRes, parkRes]) => {
      if (pkgRes.data) { const d = pkgRes.data.map(mapPackage); setPackages(d); saveToCache('packages', d); }
      if (msgRes.data) { const d = msgRes.data.map(mapMessage); setMessages(d); saveToCache('messages', d); }
      if (visitRes.data) { const d = visitRes.data.map(mapVisit); setVisits(d); saveToCache('visits', d); }
      if (novRes.data) { const d = novRes.data.map(mapNovedad); setNovedades(d); saveToCache('novedades', d); }
      if (settRes.data) { const d = { conciergerName: settRes.data.concierger_name, buildingName: settRes.data.building_name }; setSettings(d); saveToCache('settings', d); }
      if (resRes.data) { const d = resRes.data.map(mapResident); setResidents(d); saveToCache('residents', d); }
      if (concRes.data) { const d = concRes.data.map(mapConcierge); setConcierges(d); saveToCache('concierges', d); }
      if (provRes.data) { const d = provRes.data.map(mapProvider); setProviders(d); saveToCache('providers', d); }
      if (parkRes.data) { const d = parkRes.data.map(mapParkingSpot); setParkingSpots(d); saveToCache('parkingSpots', d); }
      console.log('[DataProvider] Supabase sync complete — cache updated');
      setLoaded(true);
    }).catch(() => {
      // Supabase unreachable — app continues with cached data
      console.warn('[DataProvider] Supabase unreachable, using cached data');
      setLoaded(true);
    });

    // Realtime: packages
    const pkgChannel = supabase
      .channel('global-packages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'packages' }, (p) => {
        const pkg = mapPackage(p.new);
        setPackages(prev => prev.some(x => x.id === pkg.id) ? prev : [pkg, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'packages' }, (p) => {
        const pkg = mapPackage(p.new);
        setPackages(prev => prev.map(x => x.id === pkg.id ? pkg : x));
      })
      .subscribe();

    // Realtime: whatsapp messages
    const msgChannel = supabase
      .channel('global-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' }, (p) => {
        const msg = mapMessage(p.new);
        setMessages(prev => prev.some(x => x.id === msg.id) ? prev : [...prev, msg]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'whatsapp_messages' }, (p) => {
        const msg = mapMessage(p.new);
        setMessages(prev => prev.map(x => x.id === msg.id ? msg : x));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pkgChannel);
      supabase.removeChannel(msgChannel);
    };
  }, []);

  const value = useMemo(() => ({
    packages, setPackages, messages, setMessages, visits, setVisits,
    novedades, setNovedades, settings, setSettings, residents, setResidents,
    concierges, setConcierges, providers, setProviders, parkingSpots, setParkingSpots, loaded,
  }), [packages, messages, visits, novedades, settings, residents, concierges, providers, parkingSpots, loaded]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
