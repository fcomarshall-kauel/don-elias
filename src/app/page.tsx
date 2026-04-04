'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useNovedades } from '@/hooks/useNovedades';
import { DemoSeeder } from '@/components/ui/DemoSeeder';
import {
  Users, Package, BookOpen, RefreshCw, Tv2,
  LogOut, UtensilsCrossed, AlertTriangle, User, Wrench, MessageCircle,
} from 'lucide-react';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 6 && h < 13) return 'Buenos días';
  if (h >= 13 && h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right">
      <p className="text-5xl font-black text-[#0056D2] tracking-tight">{time}</p>
      <p className="text-xl font-bold text-slate-500 capitalize mt-1">{date}</p>
    </div>
  );
}

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  Icon: typeof Users;
  border: string;
  bg: string;
  iconColor: string;
};

export default function DashboardPage() {
  const { settings } = useSettings();
  const { activeVisits, recentVisits } = useVisits();
  const { pendingPackages } = usePackages();
  const { recentNovedades } = useNovedades();
  const { conversationList } = useWhatsAppMessages();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    const t = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(t);
  }, []);

  const feed = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    for (const v of activeVisits) {
      const iconMap = { personal: User, empleada: Users, mantencion: Wrench };
      items.push({
        id: v.id,
        title: v.type === 'personal' ? 'Visita ingresada' : v.type === 'empleada' ? 'Empleada ingresada' : 'Mantención ingresada',
        subtitle: `${v.visitorName} · Depto ${v.destinationApt}`,
        time: v.checkedInAt,
        Icon: iconMap[v.type],
        border: 'border-l-[#0056D2]',
        bg: 'bg-blue-50',
        iconColor: 'text-[#0056D2]',
      });
    }

    for (const v of recentVisits.slice(0, 3)) {
      items.push({
        id: v.id + '-out',
        title: 'Salida registrada',
        subtitle: `${v.visitorName} · Depto ${v.destinationApt}`,
        time: v.checkedOutAt!,
        Icon: LogOut,
        border: 'border-l-slate-400',
        bg: 'bg-slate-50',
        iconColor: 'text-slate-500',
      });
    }

    for (const p of pendingPackages) {
      const isFood = p.type === 'food';
      items.push({
        id: p.id,
        title: isFood ? 'Delivery / Comida' : p.type === 'supermercado' ? 'Supermercado' : p.type === 'other' ? 'Otro' : 'Paquete recibido',
        subtitle: `Depto ${p.recipientApt}${p.notifiedAt ? ' · Notificado ✓' : ' · Sin notificar'}`,
        time: p.receivedAt,
        Icon: isFood ? UtensilsCrossed : Package,
        border: isFood ? 'border-l-orange-500' : 'border-l-[#0056D2]',
        bg: isFood ? 'bg-orange-50' : 'bg-blue-50',
        iconColor: isFood ? 'text-orange-600' : 'text-[#0056D2]',
      });
    }

    for (const n of recentNovedades.filter(x => !x.isHandoverEntry).slice(0, 3)) {
      items.push({
        id: n.id,
        title: n.category === 'urgente' ? '⚠ Novedad urgente' : n.category === 'tarea' ? 'Tarea pendiente' : 'Novedad',
        subtitle: n.text.length > 55 ? n.text.slice(0, 55) + '…' : n.text,
        time: n.createdAt,
        Icon: BookOpen,
        border: n.category === 'urgente' ? 'border-l-red-500' : n.category === 'tarea' ? 'border-l-amber-500' : 'border-l-blue-400',
        bg: n.category === 'urgente' ? 'bg-red-50' : n.category === 'tarea' ? 'bg-amber-50' : 'bg-blue-50',
        iconColor: n.category === 'urgente' ? 'text-red-600' : n.category === 'tarea' ? 'text-amber-600' : 'text-blue-600',
      });
    }

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [activeVisits, recentVisits, pendingPackages, recentNovedades]);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-bg">
      <DemoSeeder />

      {/* Header */}
      <header className="bg-white shadow-sm shrink-0 px-8 py-6 flex justify-between items-center border-b border-slate-200">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary shrink-0">
            <User className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {greeting}, {settings.conciergerName}
            </h1>
            <p className="text-2xl text-slate-500 font-medium mt-1">Conserje de Turno · {settings.buildingName}</p>
          </div>
        </div>
        <LiveClock />
      </header>

      {/* Main */}
      <main className="flex-1 p-6 overflow-hidden flex gap-6">

        {/* Left column — CSS grid so top row (1fr) fills space and bottom row is fixed */}
        <div className="flex-1 min-w-0 min-h-0 grid gap-4 overflow-hidden" style={{ gridTemplateRows: '1fr auto' }}>

          {/* Top: 2 big action buttons */}
          <div className="grid grid-cols-2 gap-4 min-h-0">
            <Link href="/visitas" className="contents">
              <button className="bg-primary hover:bg-primary-dark active:bg-[#003080] text-white rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 p-5 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full h-full">
                <div className="bg-white/20 p-4 rounded-full shrink-0">
                  <Users className="w-12 h-12" />
                </div>
                <span className="text-3xl font-bold text-center leading-tight">Registrar<br/>Visita</span>
                {activeVisits.length > 0 && (
                  <span className="bg-white/25 text-white text-lg font-bold px-4 py-1 rounded-full shrink-0">
                    {activeVisits.length} activa{activeVisits.length !== 1 ? 's' : ''}
                  </span>
                )}
              </button>
            </Link>

            <Link href="/paquetes" className="contents">
              <button className="bg-[#00875A] hover:bg-[#006644] active:bg-[#005533] text-white rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 p-5 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative w-full h-full">
                {pendingPackages.length > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-4 border-[#00875A] shadow">
                    {pendingPackages.length}
                  </div>
                )}
                <div className="bg-white/20 p-4 rounded-full shrink-0">
                  <Package className="w-12 h-12" />
                </div>
                <span className="text-3xl font-bold text-center leading-tight">Paquetes<br/>Recibidos</span>
              </button>
            </Link>
          </div>

          {/* Bottom: 4 secondary buttons (2×2) */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3" style={{ height: '152px' }}>
            <Link href="/novedades" className="contents">
              <button className="bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 p-2 transition-colors cursor-pointer w-full">
                <BookOpen className="w-8 h-8 text-slate-700 shrink-0" />
                <span className="text-base font-bold text-slate-800">Novedades</span>
              </button>
            </Link>
            <Link href="/lobby" target="_blank" className="contents">
              <button className="bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 p-2 transition-colors cursor-pointer w-full">
                <Tv2 className="w-8 h-8 text-slate-700 shrink-0" />
                <span className="text-base font-bold text-slate-800">Lobby TV</span>
              </button>
            </Link>
            <Link href="/mensajes" className="contents">
              <button className="hover:opacity-90 active:opacity-80 border-2 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 p-2 transition-all cursor-pointer w-full relative" style={{ background: '#25D366', borderColor: '#1da851' }}>
                <MessageCircle className="w-8 h-8 text-white shrink-0" />
                <span className="text-base font-bold text-white">WhatsApp</span>
                {conversationList.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {conversationList.length}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/turno" className="contents">
              <button className="bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 p-2 transition-colors cursor-pointer w-full">
                <RefreshCw className="w-8 h-8 text-slate-700 shrink-0" />
                <span className="text-base font-bold text-slate-800">Turno</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right panel: activity feed */}
        <div className="w-95 shrink-0 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Últimos Movimientos</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {feed.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-lg font-medium">
                Sin actividad registrada
              </div>
            ) : (
              feed.map(item => (
                <div
                  key={item.id}
                  className={`${item.bg} border-l-8 ${item.border} p-4 rounded-r-xl flex items-start gap-3`}
                >
                  <item.Icon className={`w-8 h-8 mt-0.5 shrink-0 ${item.iconColor}`} />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900 leading-tight">{item.title}</p>
                    <p className="text-base text-slate-600 mt-0.5 truncate">{item.subtitle}</p>
                    <p className="text-sm text-slate-400 font-medium mt-1">{formatTime(item.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-200 shrink-0">
            <Link href="/novedades">
              <button className="w-full bg-slate-100 text-slate-700 py-4 rounded-xl text-xl font-bold hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer">
                Ver Historial Completo
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-8 py-4 shrink-0 flex justify-between items-center">
        <Link href="/turno">
          <button className="flex items-center gap-3 text-slate-600 hover:text-slate-900 px-6 py-3 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer">
            <RefreshCw className="w-7 h-7" />
            <span className="text-xl font-bold">Cambio de Turno</span>
          </button>
        </Link>
        <button className="flex items-center gap-3 bg-red-100 text-red-700 px-8 py-4 rounded-xl hover:bg-red-200 active:bg-red-300 transition-colors border-2 border-red-200 cursor-pointer">
          <AlertTriangle className="w-7 h-7" />
          <span className="text-xl font-bold">SOS / Emergencia</span>
        </button>
      </footer>
    </div>
  );
}
