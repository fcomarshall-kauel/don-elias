'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DictationInput } from '@/components/ui/DictationInput';
import { VisitType, ParkingSpot } from '@/types';
import { CheckCircle, Car, PersonStanding } from 'lucide-react';

const TYPE_LABELS: Record<VisitType, string> = {
  personal: 'Visita Personal',
  empleada: 'Empleada',
  mantencion: 'Mantención',
};

interface VisitDetailModalProps {
  isOpen: boolean;
  apt: string;
  type: VisitType;
  initialName?: string;
  parkingSpots?: ParkingSpot[];
  occupiedSpots?: Set<string>;
  onConfirm: (name: string, company?: string, vehiclePlate?: string, parkingSpot?: string) => void;
  onClose: () => void;
}

export function VisitDetailModal({
  isOpen, apt, type, initialName, parkingSpots, occupiedSpots,
  onConfirm, onClose,
}: VisitDetailModalProps) {
  const [name, setName] = useState(initialName ?? '');
  const [company, setCompany] = useState('');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [plate, setPlate] = useState('');
  const [selectedSpot, setSelectedSpot] = useState('');
  const [customSpot, setCustomSpot] = useState('');
  const [showCustomSpot, setShowCustomSpot] = useState(false);
  const [phase, setPhase] = useState<'form' | 'success'>('form');

  const [prevInitial, setPrevInitial] = useState(initialName);
  if (initialName !== prevInitial) {
    setPrevInitial(initialName);
    if (initialName) setName(initialName);
  }

  const activeSpots = (parkingSpots ?? []).filter(s => s.isActive);
  const finalSpot = showCustomSpot ? customSpot.trim() : selectedSpot;

  const handleConfirm = () => {
    if (!name.trim()) return;
    setPhase('success');
    setTimeout(() => {
      onConfirm(
        name.trim(),
        type === 'mantencion' ? company.trim() || undefined : undefined,
        hasVehicle ? plate.trim().toUpperCase() || undefined : undefined,
        hasVehicle ? finalSpot || undefined : undefined,
      );
      setName(''); setCompany(''); setHasVehicle(false); setPlate('');
      setSelectedSpot(''); setCustomSpot(''); setShowCustomSpot(false); setPhase('form');
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={phase === 'form' ? onClose : () => {}}>
      {phase === 'success' ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3 animate-[fadeScale_0.4s_ease-out]">
          <CheckCircle className="w-16 h-16 text-[#00875A]" />
          <p className="text-2xl font-bold text-[#00875A]">Registrado</p>
          <p className="text-slate-400 text-sm">Depto. {apt} — {name}</p>
          {hasVehicle && plate && (
            <p className="text-slate-400 text-xs">🚗 {plate.toUpperCase()}{finalSpot ? ` · ${finalSpot}` : ''}</p>
          )}
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Depto. {apt}</h2>
          <p className="text-sm text-slate-400 mb-4 font-medium">{TYPE_LABELS[type]}</p>

          <div className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">Nombre del visitante</p>
              <DictationInput
                value={name}
                onChange={setName}
                placeholder="Ej: María González"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[#0056D2]"
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim() && !hasVehicle) handleConfirm(); }}
              />
            </div>

            {/* Company (mantención only) */}
            {type === 'mantencion' && (
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">Empresa / Tipo de trabajo</p>
                <DictationInput
                  value={company}
                  onChange={setCompany}
                  placeholder="Ej: TK Ascensores, Gasfíter"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[#0056D2]"
                />
              </div>
            )}

            {/* Vehicle toggle */}
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">¿Viene en auto?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setHasVehicle(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors cursor-pointer ${
                    hasVehicle ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <Car className="w-4 h-4" /> Sí
                </button>
                <button
                  onClick={() => { setHasVehicle(false); setPlate(''); setSelectedSpot(''); setCustomSpot(''); setShowCustomSpot(false); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors cursor-pointer ${
                    !hasVehicle ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <PersonStanding className="w-4 h-4" /> No
                </button>
              </div>
            </div>

            {/* Vehicle details */}
            {hasVehicle && (
              <>
                {/* Plate */}
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">Patente</p>
                  <input
                    value={plate}
                    onChange={e => setPlate(e.target.value.toUpperCase())}
                    placeholder="ABCD12"
                    maxLength={7}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold tracking-widest uppercase text-center focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Parking spot */}
                {activeSpots.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-2">Estacionamiento</p>
                    <div className="flex flex-wrap gap-2">
                      {activeSpots.map(spot => {
                        const occupied = occupiedSpots?.has(spot.name) ?? false;
                        const isSelected = selectedSpot === spot.name && !showCustomSpot;
                        return (
                          <button
                            key={spot.id}
                            onClick={() => { if (!occupied) { setSelectedSpot(spot.name); setShowCustomSpot(false); } }}
                            disabled={occupied}
                            className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                              occupied
                                ? 'border-red-200 bg-red-50 text-red-300 cursor-not-allowed'
                                : isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-pointer'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer'
                            }`}
                          >
                            {occupied ? '🔴' : isSelected ? '🟢' : '⚪'} {spot.name}
                          </button>
                        );
                      })}
                    </div>
                    {!showCustomSpot ? (
                      <button
                        onClick={() => { setShowCustomSpot(true); setSelectedSpot(''); }}
                        className="mt-2 text-xs text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                      >
                        Otro lugar...
                      </button>
                    ) : (
                      <input
                        value={customSpot}
                        onChange={e => setCustomSpot(e.target.value)}
                        placeholder="Ej: Calle, Subterráneo B2"
                        className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {/* Submit */}
            <button
              onClick={handleConfirm}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl text-base font-bold text-white bg-[#0056D2] hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer"
            >
              Registrar Ingreso
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
