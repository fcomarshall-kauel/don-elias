'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getResidentsByApt, getTowerByApt } from '@/data/residents';
import { DictationInput } from '@/components/ui/DictationInput';
import { CheckCircle, User, Package as PkgIcon, UtensilsCrossed, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { Package } from '@/types';

const typeEmoji: Record<string, string> = {
  food: '🍔', supermercado: '🛒', normal: '📦', other: '📄',
};

const typeLabel: Record<string, string> = {
  food: 'Comida', supermercado: 'Super', normal: 'Paquete', other: 'Otros',
};

interface DeliveryModalProps {
  isOpen: boolean;
  apt: string;
  packages: Package[];
  onConfirm: (deliveredTo: string, packageIds: string[]) => void;
  onClose: () => void;
}

export function DeliveryModal({ isOpen, apt, packages, onConfirm, onClose }: DeliveryModalProps) {
  const residents = getResidentsByApt(apt);
  const tower = getTowerByApt(apt);
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(packages.map(p => p.id)));

  const togglePkg = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = (name: string) => {
    if (selectedIds.size === 0) return;
    onConfirm(name, Array.from(selectedIds));
    setCustomName('');
    setShowCustom(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entregar — Depto. ${apt}`}>
      {tower && (
        <p className="text-sm text-slate-400 -mt-2 mb-4 font-medium">{tower}</p>
      )}

      {/* Package selection (if more than 1) */}
      {packages.length > 1 && (
        <div className="mb-4">
          <p className="text-sm text-slate-500 mb-2 font-medium">Paquetes a entregar:</p>
          <div className="flex flex-col gap-1.5">
            {packages.map(pkg => {
              const checked = selectedIds.has(pkg.id);
              const time = new Date(pkg.receivedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
              return (
                <label
                  key={pkg.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 cursor-pointer transition-colors ${
                    checked
                      ? 'border-[#00875A] bg-green-50'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePkg(pkg.id)}
                    className="w-4 h-4 accent-[#00875A]"
                  />
                  <span className="text-sm">{typeEmoji[pkg.type] ?? '📦'}</span>
                  <span className="text-sm font-semibold text-slate-700 flex-1">
                    {typeLabel[pkg.type] ?? 'Paquete'}
                    {pkg.provider && <span className="text-slate-400 font-normal"> · {pkg.provider}</span>}
                  </span>
                  <span className="text-[10px] text-slate-400">{time}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Who picks up */}
      <p className="text-sm text-slate-500 mb-3 font-medium">
        {selectedIds.size === 0 ? 'Selecciona al menos un paquete' : 'Quién retira:'}
      </p>

      {selectedIds.size > 0 && (
        <>
          {residents.length > 0 ? (
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
        </>
      )}
    </Modal>
  );
}
