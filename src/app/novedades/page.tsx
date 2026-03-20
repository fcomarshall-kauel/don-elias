'use client';
import { AppShell } from '@/components/layout/AppShell';
import { NovedadForm } from '@/components/novedades/NovedadForm';
import { NovedadCard } from '@/components/novedades/NovedadCard';
import { useNovedades } from '@/hooks/useNovedades';
import { useSettings } from '@/hooks/useSettings';
import { NovedadCategory } from '@/types';
import { BookOpen } from 'lucide-react';

export default function NovedadesPage() {
  const { recentNovedades, addNovedad } = useNovedades();
  const { settings } = useSettings();

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex gap-6 p-6">

        {/* Left: form panel */}
        <div className="w-80 shrink-0 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Nueva Novedad</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <NovedadForm
              authorName={settings.conciergerName}
              onSubmit={(data: { text: string; category: NovedadCategory; author: string }) => addNovedad(data)}
            />
          </div>
        </div>

        {/* Right: novedades list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Registro del Turno</h2>
            {recentNovedades.length > 0 && (
              <span className="bg-slate-500 text-white text-lg font-bold px-3 py-0.5 rounded-full">
                {recentNovedades.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {recentNovedades.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <BookOpen className="w-16 h-16 text-slate-300" />
                <p className="text-xl font-semibold">Sin novedades registradas</p>
              </div>
            ) : (
              recentNovedades.map(n => (
                <NovedadCard key={n.id} novedad={n} />
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
