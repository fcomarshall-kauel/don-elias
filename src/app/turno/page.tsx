'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useVisits } from '@/hooks/useVisits';
import { usePackages } from '@/hooks/usePackages';
import { useNovedades } from '@/hooks/useNovedades';
import { useSettings } from '@/hooks/useSettings';
import { Users, Package, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';

export default function TurnoPage() {
  const router = useRouter();
  const { activeVisits } = useVisits();
  const { pendingPackages } = usePackages();
  const { recentNovedades, addHandoverEntry } = useNovedades();
  const { settings, updateConciergerName } = useSettings();

  const [newName, setNewName] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const openTareas = recentNovedades.filter(n => !n.isHandoverEntry && n.category === 'tarea');

  const handleConfirm = () => {
    if (!newName.trim()) { setError('Ingresa el nombre del nuevo conserje.'); return; }
    const summary = `Cambio de turno: ${settings.conciergerName} → ${newName.trim()}. Visitas activas: ${activeVisits.length}. Paquetes pendientes: ${pendingPackages.length}. Tareas abiertas: ${openTareas.length}.`;
    addHandoverEntry(summary, settings.conciergerName);
    updateConciergerName(newName.trim());
    setDone(true);
  };

  if (done) {
    return (
      <AppShell>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-8">
          <CheckCircle className="w-24 h-24 text-[#00875A]" />
          <div>
            <p className="text-4xl font-extrabold text-slate-900">¡Turno transferido!</p>
            <p className="text-2xl text-slate-500 mt-2">Bienvenido/a, <span className="font-bold text-slate-800">{newName.trim()}</span></p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-[#0056D2] hover:bg-primary-dark text-white px-10 py-5 rounded-2xl text-2xl font-bold transition-colors cursor-pointer"
          >
            Ir al inicio
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex items-center justify-center p-8">
        <div className="w-full max-w-2xl flex flex-col gap-6">

          {/* Summary cards */}
          <div>
            <p className="text-xl text-slate-500 mb-4 font-medium">
              Resumen del turno de <span className="font-bold text-slate-800">{settings.conciergerName}</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, count: activeVisits.length, label: 'Visitas activas', color: 'text-[#0056D2]', bg: 'bg-blue-50 border-blue-200' },
                { icon: Package, count: pendingPackages.length, label: 'Paquetes pendientes', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                { icon: BookOpen, count: openTareas.length, label: 'Tareas abiertas', color: 'text-[#5243AA]', bg: 'bg-purple-50 border-purple-200' },
              ].map(({ icon: Icon, count, label, color, bg }) => (
                <div key={label} className={`${bg} border-2 rounded-2xl p-5 flex flex-col items-center`}>
                  <Icon className={`w-8 h-8 ${color} mb-2`} />
                  <p className="text-4xl font-black text-slate-800">{count}</p>
                  <p className="text-sm text-slate-500 text-center mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <label className="block text-lg font-bold text-slate-700 mb-3 uppercase tracking-wide">Nombre del nuevo conserje</label>
            <input
              className="w-full border-2 border-slate-200 rounded-xl px-5 py-4 text-2xl font-semibold focus:border-[#0056D2] focus:outline-none"
              placeholder="Ej: Roberto Fuentes"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            {error && <p className="text-red-600 text-lg mt-2 font-semibold">{error}</p>}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-[#00875A] hover:bg-[#006644] active:bg-[#005533] text-white py-5 rounded-2xl text-2xl font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-3"
          >
            <RefreshCw className="w-7 h-7" />
            Confirmar Cambio de Turno
          </button>
        </div>
      </div>
    </AppShell>
  );
}
