'use client';
import { useEffect, useRef, useState } from 'react';
import { Package } from '@/types';
import { Bell, CheckCircle, UtensilsCrossed, Package as PkgIcon, MoreHorizontal, ShoppingCart } from 'lucide-react';

const styles: Record<Package['type'], { border: string; bg: string; iconColor: string; Icon: typeof PkgIcon }> = {
  food:         { border: 'border-l-orange-500', bg: 'bg-orange-50',  iconColor: 'text-orange-600', Icon: UtensilsCrossed },
  supermercado: { border: 'border-l-green-500',  bg: 'bg-green-50',   iconColor: 'text-green-600',  Icon: ShoppingCart },
  normal:       { border: 'border-l-[#0056D2]',  bg: 'bg-blue-50',   iconColor: 'text-[#0056D2]',  Icon: PkgIcon },
  other:        { border: 'border-l-slate-400',  bg: 'bg-slate-50',  iconColor: 'text-slate-500',  Icon: MoreHorizontal },
};

const typeLabel: Record<Package['type'], string> = {
  food: 'Comida',
  supermercado: 'Super',
  normal: 'Paquete',
  other: 'Otros',
};

interface PackageCardProps {
  pkg: Package;
  isNew?: boolean;
  onNotify: (id: string) => void;
  onDeliver: (id: string) => void;
}

export function PackageCard({ pkg, isNew, onNotify, onDeliver }: PackageCardProps) {
  const s = styles[pkg.type] ?? styles.other;
  const time = new Date(pkg.receivedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const [blinking, setBlinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isNew) {
      requestAnimationFrame(() => setBlinking(true));
      timerRef.current = setTimeout(() => setBlinking(false), 1200);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [isNew]);

  return (
    <div
      className={`${s.bg} border-l-[6px] ${s.border} rounded-r-xl p-3 flex flex-col gap-2`}
      style={blinking ? { animation: 'slideIn 0.25s ease-out, blink 0.6s ease-in-out 0.25s 2' } : undefined}
    >
      <div className="flex items-center gap-2">
        <s.Icon className={`w-5 h-5 shrink-0 ${s.iconColor}`} />
        <span className="text-lg font-bold text-slate-900 flex-1">Depto. {pkg.recipientApt}</span>
        <span className="text-xs text-slate-400 font-medium">{time}</span>
      </div>

      <p className="text-sm text-slate-500 leading-tight">
        {typeLabel[pkg.type]}
        {pkg.provider && <span className="text-slate-400"> · {pkg.provider}</span>}
        {pkg.notifiedAt && <span className="text-green-600"> · Notificado ✓</span>}
      </p>

      {pkg.note && (
        <p className="text-xs text-slate-400 italic leading-tight">{pkg.note}</p>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onNotify(pkg.id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-600 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          Avisar
        </button>
        <button
          onClick={() => onDeliver(pkg.id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#00875A] hover:bg-[#006644] text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Entregar
        </button>
      </div>
    </div>
  );
}
