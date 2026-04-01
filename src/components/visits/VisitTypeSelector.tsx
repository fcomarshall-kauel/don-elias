'use client';
import { VisitType } from '@/types';
import { User, Users, Wrench } from 'lucide-react';

const TYPES: { value: VisitType; label: string; icon: typeof User; bg: string; border: string; text: string }[] = [
  { value: 'personal',   label: 'Personal',   icon: User,   bg: 'bg-blue-50 hover:bg-blue-100',   border: 'border-[#0056D2]', text: 'text-[#0056D2]' },
  { value: 'empleada',   label: 'Empleada',   icon: Users,  bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-[#5243AA]', text: 'text-[#5243AA]' },
  { value: 'mantencion', label: 'Mantención', icon: Wrench, bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-500', text: 'text-amber-600' },
];

interface VisitTypeSelectorProps {
  onSelectType: (type: VisitType) => void;
}

export function VisitTypeSelector({ onSelectType }: VisitTypeSelectorProps) {
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
