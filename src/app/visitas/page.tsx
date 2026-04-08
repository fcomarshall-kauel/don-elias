'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { VisitTypeSelector } from '@/components/visits/VisitTypeSelector';
import { VisitDetailModal } from '@/components/visits/VisitDetailModal';
import { VisitVoiceButton } from '@/components/visits/VisitVoiceButton';
import { VisitCard } from '@/components/visits/VisitCard';
import { NumpadModal } from '@/components/ui/NumpadModal';
import { useVisits } from '@/hooks/useVisits';
import { useParkingSpots } from '@/hooks/useParkingSpots';
import { useResidents } from '@/hooks/useResidents';
import { VisitType } from '@/types';
import { VisitVoiceCommand } from '@/lib/voiceParser';
import { Users, User, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TYPE_NUMPAD: Record<VisitType, { label: string; icon: LucideIcon; color: string }> = {
  personal:   { label: 'Visita Personal',   icon: User,   color: 'text-[#0056D2]' },
  empleada:   { label: 'Empleada',          icon: Users,  color: 'text-[#5243AA]' },
  mantencion: { label: 'Mantención',        icon: Wrench, color: 'text-amber-600' },
};

export default function VisitasPage() {
  const { activeVisits, recentVisits, addVisit, checkOut } = useVisits();
  const { activeSpots, occupiedSpots } = useParkingSpots();
  const { getPhonesByApt } = useResidents();

  // Flujo: tipo → numpad → detalle
  const [selectedType, setSelectedType] = useState<VisitType | null>(null);
  const [pendingVisit, setPendingVisit] = useState<{ apt: string; type: VisitType; initialName?: string } | null>(null);

  // Paso 1: tipo → abre numpad
  const handleSelectType = (type: VisitType) => {
    setSelectedType(type);
  };

  // Paso 2: numpad confirma depto → abre detalle
  const handleNumpadConfirm = (apt: string) => {
    if (!selectedType) return;
    setPendingVisit({ apt, type: selectedType });
    setSelectedType(null);
  };

  // Paso 3: detalle confirma → registra
  const handleDetailConfirm = (name: string, company?: string, vehiclePlate?: string, parkingSpot?: string) => {
    if (!pendingVisit) return;
    addVisit({
      visitorName: name,
      destinationApt: pendingVisit.apt,
      type: pendingVisit.type,
      companyOrWorkType: company,
      vehiclePlate,
      parkingSpot,
    });
    setPendingVisit(null);
  };

  // Comando de voz
  const handleVoiceCommand = (command: VisitVoiceCommand) => {
    const type = command.type ?? 'personal';
    if (command.apt) {
      // Tiene depto → directo al modal de detalle, con nombre pre-llenado si lo hay
      setPendingVisit({ apt: command.apt, type, initialName: command.visitorName });
    } else {
      // Solo tipo → abre numpad
      setSelectedType(type);
    }
  };

  return (
    <AppShell>
      <div className="flex-1 md:overflow-hidden flex flex-col md:flex-row gap-3 md:gap-6 p-3 md:p-6 overflow-y-auto">

        {/* Left: type selector */}
        <div className="w-full md:w-72 shrink-0 bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-200 flex flex-col md:overflow-hidden">
          <div className="p-3 md:p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800">Nueva Visita</h2>
          </div>
          <div className="md:flex-1 md:overflow-y-auto p-3 md:p-5">
            <VisitTypeSelector onSelectType={handleSelectType} />
          </div>
        </div>

        {/* Right: active visits */}
        <div className="flex-1 flex flex-col md:overflow-hidden min-h-0">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 shrink-0">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800">Visitas Activas</h2>
            {activeVisits.length > 0 && (
              <span className="bg-[#0056D2] text-white text-sm md:text-lg font-bold px-2 md:px-3 py-0.5 rounded-full">
                {activeVisits.length}
              </span>
            )}
          </div>

          <div className="md:flex-1 md:overflow-y-auto flex flex-col gap-3">
            {activeVisits.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Users className="w-16 h-16 text-slate-300" />
                <p className="text-xl font-semibold">Sin visitas activas</p>
              </div>
            ) : (
              activeVisits.map(v => (
                <VisitCard key={v.id} visit={v} phoneNumber={getPhonesByApt(v.destinationApt)[0]} onCheckOut={checkOut} />
              ))
            )}

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

      {/* Modal 1: Numpad para departamento */}
      {selectedType && (
        <NumpadModal
          isOpen={true}
          label={TYPE_NUMPAD[selectedType].label}
          icon={TYPE_NUMPAD[selectedType].icon}
          iconColor={TYPE_NUMPAD[selectedType].color}
          onConfirm={handleNumpadConfirm}
          onClose={() => setSelectedType(null)}
        />
      )}

      {/* Modal 2: Nombre + empresa con dictado */}
      {pendingVisit && (
        <VisitDetailModal
          isOpen={true}
          apt={pendingVisit.apt}
          type={pendingVisit.type}
          initialName={pendingVisit.initialName}
          parkingSpots={activeSpots}
          occupiedSpots={occupiedSpots}
          onConfirm={handleDetailConfirm}
          onClose={() => setPendingVisit(null)}
        />
      )}

      <VisitVoiceButton onCommand={handleVoiceCommand} />
    </AppShell>
  );
}
