'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DictationInput } from '@/components/ui/DictationInput';
import { VisitType } from '@/types';
import { CheckCircle } from 'lucide-react';

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
  onConfirm: (name: string, company?: string) => void;
  onClose: () => void;
}

export function VisitDetailModal({ isOpen, apt, type, initialName, onConfirm, onClose }: VisitDetailModalProps) {
  const [name, setName] = useState(initialName ?? '');
  const [company, setCompany] = useState('');
  const [phase, setPhase] = useState<'form' | 'success'>('form');

  // Actualizar nombre si viene pre-llenado desde voz
  const [prevInitial, setPrevInitial] = useState(initialName);
  if (initialName !== prevInitial) {
    setPrevInitial(initialName);
    if (initialName) setName(initialName);
  }

  const handleConfirm = () => {
    if (!name.trim()) return;
    setPhase('success');
    setTimeout(() => {
      onConfirm(name.trim(), type === 'mantencion' ? company.trim() || undefined : undefined);
      setName('');
      setCompany('');
      setPhase('form');
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={phase === 'form' ? onClose : () => {}}>
      {phase === 'success' ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3 animate-[fadeScale_0.4s_ease-out]">
          <CheckCircle className="w-16 h-16 text-[#00875A]" />
          <p className="text-2xl font-bold text-[#00875A]">Registrado</p>
          <p className="text-slate-400 text-sm">Depto. {apt} — {name}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Depto. {apt}</h2>
          <p className="text-sm text-slate-400 mb-4 font-medium">{TYPE_LABELS[type]}</p>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">Nombre del visitante</p>
              <DictationInput
                value={name}
                onChange={setName}
                placeholder="Ej: María González"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[#0056D2]"
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleConfirm(); }}
              />
            </div>

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
