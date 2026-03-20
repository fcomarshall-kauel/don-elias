'use client';
import { AppShell } from '@/components/layout/AppShell';
import { VisitForm } from '@/components/visits/VisitForm';
import { VisitCard } from '@/components/visits/VisitCard';
import { useVisits } from '@/hooks/useVisits';
import { VisitType } from '@/types';
import { Users } from 'lucide-react';

export default function VisitasPage() {
  const { activeVisits, recentVisits, addVisit, checkOut } = useVisits();

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex gap-6 p-6">

        {/* Left: form panel */}
        <div className="w-80 shrink-0 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Nueva Visita</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <VisitForm
              onSubmit={(data: { visitorName: string; destinationApt: string; type: VisitType; companyOrWorkType?: string }) => addVisit(data)}
            />
          </div>
        </div>

        {/* Right: active visits list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Visitas Activas</h2>
            {activeVisits.length > 0 && (
              <span className="bg-[#0056D2] text-white text-lg font-bold px-3 py-0.5 rounded-full">
                {activeVisits.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {activeVisits.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Users className="w-16 h-16 text-slate-300" />
                <p className="text-xl font-semibold">Sin visitas activas</p>
              </div>
            ) : (
              activeVisits.map(v => (
                <VisitCard key={v.id} visit={v} onCheckOut={checkOut} />
              ))
            )}

            {/* Recent exits as collapsible */}
            {recentVisits.length > 0 && (
              <details className="bg-white rounded-2xl border border-slate-200 mt-2">
                <summary className="p-4 text-base font-semibold text-slate-500 cursor-pointer select-none">
                  Historial del día ({recentVisits.length})
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {recentVisits.map(v => (
                    <div key={v.id} className="py-2 border-b border-slate-100 last:border-0 flex justify-between">
                      <div>
                        <p className="font-semibold text-slate-700">{v.visitorName}</p>
                        <p className="text-sm text-slate-400">Depto. {v.destinationApt}</p>
                      </div>
                      <p className="text-sm text-slate-400 self-center">
                        {new Date(v.checkedOutAt!).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
