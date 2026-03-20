'use client';
import { Visit } from '@/types';
import { Users, Wrench, User, LogOut } from 'lucide-react';

const typeLabels: Record<Visit['type'], string> = {
  personal: 'Visita personal',
  empleada: 'Empleada doméstica',
  mantencion: 'Mantención / Trabajo',
};
const typeIcons = { personal: User, empleada: Users, mantencion: Wrench };
const typeColors = {
  personal:   { border: 'border-l-[#0056D2]', bg: 'bg-blue-50',   icon: 'text-[#0056D2]' },
  empleada:   { border: 'border-l-[#5243AA]', bg: 'bg-purple-50', icon: 'text-[#5243AA]' },
  mantencion: { border: 'border-l-amber-500', bg: 'bg-amber-50',  icon: 'text-amber-600' },
};

function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.floor(mins / 60)}h ${mins % 60}min`;
}

interface VisitCardProps {
  visit: Visit;
  onCheckOut: (id: string) => void;
}

export function VisitCard({ visit, onCheckOut }: VisitCardProps) {
  const Icon = typeIcons[visit.type];
  const c = typeColors[visit.type];

  return (
    <div className={`${c.bg} border-l-8 ${c.border} p-4 rounded-r-xl flex items-center gap-4`}>
      <Icon className={`w-8 h-8 shrink-0 ${c.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-slate-900 truncate">{visit.visitorName}</p>
        <p className="text-base text-slate-600">
          Depto <span className="font-semibold">{visit.destinationApt}</span>
          {visit.companyOrWorkType ? ` · ${visit.companyOrWorkType}` : ''}
        </p>
        <p className="text-sm text-slate-400 font-medium mt-0.5">{typeLabels[visit.type]} · {elapsed(visit.checkedInAt)}</p>
      </div>
      <button
        onClick={() => onCheckOut(visit.id)}
        className="shrink-0 flex items-center gap-2 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 border-2 border-red-200 px-4 py-2.5 rounded-xl font-bold text-base transition-colors cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        Salida
      </button>
    </div>
  );
}
