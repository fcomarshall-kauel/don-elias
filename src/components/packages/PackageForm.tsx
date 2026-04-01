'use client';
import { PackageType } from '@/types';
import { UtensilsCrossed, Package, ShoppingCart, MoreHorizontal } from 'lucide-react';

const TYPES: { value: PackageType; label: string; icon: typeof Package; bg: string; border: string; text: string }[] = [
  { value: 'normal',       label: 'Paquete',      icon: Package,         bg: 'bg-blue-50 hover:bg-blue-100',   border: 'border-[#0056D2]', text: 'text-[#0056D2]' },
  { value: 'supermercado',  label: 'Supermercado', icon: ShoppingCart,    bg: 'bg-green-50 hover:bg-green-100', border: 'border-green-500', text: 'text-green-600' },
  { value: 'food',          label: 'Comida',       icon: UtensilsCrossed, bg: 'bg-orange-50 hover:bg-orange-100', border: 'border-orange-500', text: 'text-orange-600' },
  { value: 'other',         label: 'Otros',        icon: MoreHorizontal,  bg: 'bg-slate-50 hover:bg-slate-100', border: 'border-slate-400', text: 'text-slate-500' },
];

interface PackageFormProps {
  onSelectType: (type: PackageType) => void;
}

export function PackageForm({ onSelectType }: PackageFormProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {TYPES.map(({ value, label, icon: Icon, bg, border, text }) => (
        <button
          key={value}
          onClick={() => onSelectType(value)}
          className={`flex items-center gap-4 px-5 py-5 rounded-2xl border-2 ${border} ${bg} ${text} transition-colors cursor-pointer active:scale-[0.97]`}
        >
          <Icon className="w-8 h-8 shrink-0" />
          <span className="text-xl font-bold">{label}</span>
        </button>
      ))}
    </div>
  );
}
