'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PackageType } from '@/types';
import { Delete, UtensilsCrossed, Package, ShoppingCart, MoreHorizontal } from 'lucide-react';

const TYPE_CONFIG: Record<PackageType, { label: string; icon: typeof Package; color: string }> = {
  normal:       { label: 'Paquete',      icon: Package,         color: 'text-[#0056D2]' },
  supermercado: { label: 'Supermercado', icon: ShoppingCart,    color: 'text-green-600' },
  food:         { label: 'Comida',       icon: UtensilsCrossed, color: 'text-orange-600' },
  other:        { label: 'Otros',        icon: MoreHorizontal,  color: 'text-slate-500' },
};

interface NumpadModalProps {
  isOpen: boolean;
  type: PackageType;
  onConfirm: (apt: string) => void;
  onClose: () => void;
}

export function NumpadModal({ isOpen, type, onConfirm, onClose }: NumpadModalProps) {
  const [value, setValue] = useState('');

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const press = (digit: string) => {
    if (value.length < 5) setValue(prev => prev + digit);
  };

  const backspace = () => setValue(prev => prev.slice(0, -1));

  const handleConfirm = () => {
    if (!value) return;
    onConfirm(value);
    setValue('');
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Tipo seleccionado */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-6 h-6 ${config.color}`} />
        <span className={`text-lg font-bold ${config.color}`}>{config.label}</span>
      </div>

      {/* Display + OK */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-slate-100 rounded-2xl px-5 py-4 text-center min-h-[60px] flex items-center justify-center">
          {value ? (
            <span className="text-4xl font-bold text-slate-900 tracking-widest">{value}</span>
          ) : (
            <span className="text-xl text-slate-300 font-medium">Depto.</span>
          )}
        </div>
        <button
          onClick={handleConfirm}
          disabled={!value}
          className="px-6 rounded-2xl text-lg font-bold text-white bg-[#0056D2] hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer"
        >
          OK
        </button>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2">
        {['1','2','3','4','5','6','7','8','9'].map(d => (
          <button
            key={d}
            onClick={() => press(d)}
            className="py-4 rounded-xl bg-white border-2 border-slate-200 text-2xl font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          onClick={handleClose}
          className="py-4 rounded-xl bg-slate-100 text-base font-bold text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={() => press('0')}
          className="py-4 rounded-xl bg-white border-2 border-slate-200 text-2xl font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
        >
          0
        </button>
        <button
          onClick={backspace}
          className="py-4 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </Modal>
  );
}
