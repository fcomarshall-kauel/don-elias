'use client';
import { Package } from '@/types';
import { Bell, CheckCircle, UtensilsCrossed, Package as PkgIcon, FileText } from 'lucide-react';

const styles: Record<Package['type'], { border: string; bg: string; iconColor: string; Icon: typeof PkgIcon }> = {
  food:     { border: 'border-l-orange-500', bg: 'bg-orange-50',  iconColor: 'text-orange-600', Icon: UtensilsCrossed },
  normal:   { border: 'border-l-[#0056D2]',  bg: 'bg-blue-50',   iconColor: 'text-[#0056D2]',  Icon: PkgIcon },
  document: { border: 'border-l-slate-400',  bg: 'bg-slate-50',  iconColor: 'text-slate-500',  Icon: FileText },
};

const typeLabel: Record<Package['type'], string> = {
  food: 'Comida / Delivery',
  normal: 'Paquete',
  document: 'Documento',
};

interface PackageCardProps {
  pkg: Package;
  onNotify: (id: string) => void;
  onDeliver: (id: string) => void;
}

export function PackageCard({ pkg, onNotify, onDeliver }: PackageCardProps) {
  const s = styles[pkg.type];
  const time = new Date(pkg.receivedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`${s.bg} border-l-8 ${s.border} p-4 rounded-r-xl flex items-center gap-4`}>
      <s.Icon className={`w-8 h-8 shrink-0 ${s.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-slate-900">Depto. {pkg.recipientApt}</p>
        <p className="text-base text-slate-600">{typeLabel[pkg.type]}</p>
        <p className="text-sm text-slate-400 font-medium mt-0.5">
          {time}{pkg.notifiedAt ? ' · Notificado ✓' : ''}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onNotify(pkg.id)}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          Avisar
        </button>
        <button
          onClick={() => onDeliver(pkg.id)}
          className="flex items-center gap-1.5 bg-[#00875A] hover:bg-[#006644] text-white px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          Entregar
        </button>
      </div>
    </div>
  );
}
