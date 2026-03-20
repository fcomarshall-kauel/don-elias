import { Novedad } from '@/types';
import { AlertTriangle, Info, CheckSquare, RefreshCw } from 'lucide-react';

const styles = {
  urgente:     { border: 'border-l-red-500',   bg: 'bg-red-50',   icon: AlertTriangle, iconColor: 'text-red-600' },
  informativo: { border: 'border-l-[#0056D2]', bg: 'bg-blue-50',  icon: Info,          iconColor: 'text-[#0056D2]' },
  tarea:       { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: CheckSquare,   iconColor: 'text-amber-600' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return isToday ? `Hoy ${time}` : `${d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} ${time}`;
}

export function NovedadCard({ novedad }: { novedad: Novedad }) {
  if (novedad.isHandoverEntry) {
    return (
      <div className="bg-slate-50 border-l-8 border-l-slate-400 p-4 rounded-r-xl flex items-start gap-3">
        <RefreshCw className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cambio de turno</p>
          <p className="text-base text-slate-600 italic mt-0.5">{novedad.text}</p>
          <p className="text-sm text-slate-400 mt-1">{formatDate(novedad.createdAt)}</p>
        </div>
      </div>
    );
  }

  const s = styles[novedad.category];
  return (
    <div className={`${s.bg} border-l-8 ${s.border} p-4 rounded-r-xl flex items-start gap-3`}>
      <s.icon className={`w-6 h-6 shrink-0 mt-0.5 ${s.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-slate-900 leading-snug">{novedad.text}</p>
        <p className="text-sm text-slate-400 font-medium mt-1.5">
          {formatDate(novedad.createdAt)} · {novedad.author}
        </p>
      </div>
    </div>
  );
}
