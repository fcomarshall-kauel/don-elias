'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PackageType } from '@/types';
import { DictationInput } from '@/components/ui/DictationInput';
import { CheckCircle } from 'lucide-react';

// Fallback providers if DB is empty
const FALLBACK_PROVIDERS: Record<PackageType, string[]> = {
  normal: ['Mercado Libre', 'Falabella', 'Ripley', 'Paris', 'Amazon', 'AliExpress', 'Shein', 'Correos de Chile', 'Chilexpress', 'Starken', 'Blue Express', 'DHL', 'FedEx'],
  supermercado: ['Jumbo', 'Lider', 'Santa Isabel', 'Unimarc', 'Tottus', 'Cornershop'],
  food: ['Uber Eats', 'Rappi', 'PedidosYa', 'Justo'],
  other: ['Correos de Chile', 'Chilexpress', 'Notaría'],
};

const TYPE_LABELS: Record<PackageType, string> = {
  normal: 'Paquete',
  supermercado: 'Supermercado',
  food: 'Comida',
  other: 'Otros',
};

interface ProviderModalProps {
  isOpen: boolean;
  apt: string;
  type: PackageType;
  providerNames?: string[];  // From useProviders().getByType(type)
  onConfirm: (provider?: string, note?: string) => void;
  onClose: () => void;
}

export function ProviderModal({ isOpen, apt, type, providerNames, onConfirm, onClose }: ProviderModalProps) {
  const [selected, setSelected] = useState('');
  const [note, setNote] = useState('');
  const [phase, setPhase] = useState<'form' | 'success'>('form');

  const providers = providerNames && providerNames.length > 0 ? providerNames : FALLBACK_PROVIDERS[type];

  const handleConfirm = () => {
    const provider = selected || undefined;
    const trimmedNote = note.trim() || undefined;
    setPhase('success');
    setTimeout(() => {
      onConfirm(provider, trimmedNote);
      setSelected('');
      setNote('');
      setPhase('form');
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={phase === 'form' ? onClose : () => {}}>
      {phase === 'success' ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3 animate-[fadeScale_0.4s_ease-out]">
          <CheckCircle className="w-16 h-16 text-[#00875A]" />
          <p className="text-2xl font-bold text-[#00875A]">Registrado</p>
          <p className="text-slate-400 text-sm">Depto. {apt}</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Depto. {apt} — {TYPE_LABELS[type]}</h2>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">Proveedor (opcional)</p>
              <div className="flex flex-wrap gap-1.5">
                {providers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelected(selected === p ? '' : p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors cursor-pointer ${
                      selected === p
                        ? 'border-[#0056D2] bg-blue-50 text-[#0056D2]'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2">Nota (opcional)</p>
              <DictationInput
                value={note}
                onChange={setNote}
                placeholder="Ej: caja grande, frágil..."
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#0056D2]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl text-base font-bold text-white bg-[#0056D2] hover:bg-primary-dark transition-colors cursor-pointer"
              >
                {selected ? 'Confirmar' : 'Registrar sin proveedor'}
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
