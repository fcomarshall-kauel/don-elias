'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getResidentsByApt, getTowerByApt } from '@/data/residents';
import { DictationInput } from '@/components/ui/DictationInput';
import { CheckCircle, User } from 'lucide-react';

interface DeliveryModalProps {
  isOpen: boolean;
  apt: string;
  onConfirm: (deliveredTo: string) => void;
  onClose: () => void;
}

export function DeliveryModal({ isOpen, apt, onConfirm, onClose }: DeliveryModalProps) {
  const residents = getResidentsByApt(apt);
  const tower = getTowerByApt(apt);
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleConfirm = (name: string) => {
    onConfirm(name);
    setCustomName('');
    setShowCustom(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entregar — Depto. ${apt}`}>
      {tower && (
        <p className="text-sm text-slate-400 -mt-2 mb-4 font-medium">{tower}</p>
      )}

      {residents.length > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-3 font-medium">Selecciona quién retira:</p>
          <div className="flex flex-col gap-2 mb-4">
            {residents.map((name) => (
              <button
                key={name}
                onClick={() => handleConfirm(name)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-[#00875A] hover:bg-green-50 transition-colors cursor-pointer group"
              >
                <User className="w-5 h-5 text-slate-400 group-hover:text-[#00875A] shrink-0" />
                <span className="font-semibold text-slate-700 group-hover:text-[#00875A] flex-1">{name}</span>
                <CheckCircle className="w-5 h-5 text-transparent group-hover:text-[#00875A]" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3 mb-4 font-medium">
          No hay residentes registrados para este departamento.
        </p>
      )}

      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full text-center text-sm text-slate-400 hover:text-slate-600 py-2 cursor-pointer transition-colors font-medium"
        >
          Otra persona...
        </button>
      ) : (
        <div className="flex gap-2">
          <DictationInput
            value={customName}
            onChange={setCustomName}
            placeholder="Nombre de quien retira"
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#00875A]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customName.trim()) handleConfirm(customName.trim());
            }}
          />
          <button
            onClick={() => customName.trim() && handleConfirm(customName.trim())}
            disabled={!customName.trim()}
            className="bg-[#00875A] hover:bg-[#006644] disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shrink-0"
          >
            OK
          </button>
        </div>
      )}
    </Modal>
  );
}
