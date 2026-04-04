'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Clock } from '@/components/ui/Clock';

const PAGE_TITLES: Record<string, string> = {
  '/visitas':   'Registro de Visitas',
  '/paquetes':  'Control de Paquetes',
  '/mensajes':  'Mensajes WhatsApp',
  '/novedades': 'Libro de Novedades',
  '/turno':     'Cambio de Turno',
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? 'PorterOS';
  const isHome = pathname === '/';

  return (
    <header className="bg-white shadow-sm shrink-0 px-8 py-5 flex justify-between items-center border-b border-slate-200">
      <div className="flex items-center gap-4">
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <div className="text-right">
        <Clock className="text-4xl font-black text-[#0056D2] tracking-tight" />
        <p className="text-base font-bold text-slate-500 uppercase mt-0.5">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </header>
  );
}
