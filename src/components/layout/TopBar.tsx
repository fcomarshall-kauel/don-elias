'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Clock } from '@/components/ui/Clock';

const PAGE_TITLES: Record<string, string> = {
  '/visitas':             'Registro de Visitas',
  '/paquetes':            'Control de Paquetes',
  '/mensajes':            'Mensajes WhatsApp',
  '/novedades':           'Libro de Novedades',
  '/turno':               'Cambio de Turno',
  '/admin':               'Configuración',
  '/admin/edificio':      'Configuración del Edificio',
  '/admin/residentes':    'Gestión de Residentes',
  '/admin/conserjes':     'Gestión de Conserjes',
  '/admin/proveedores':   'Gestión de Proveedores',
  '/admin/estacionamientos': 'Estacionamientos',
  '/admin/whatsapp':      'WhatsApp Business',
  '/admin/qr':            'QR para Residentes',
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? 'PorterOS';
  const isHome = pathname === '/';

  return (
    <header className="bg-white shadow-sm shrink-0 px-3 py-3 md:px-8 md:py-5 flex justify-between items-center border-b border-slate-200 gap-2">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        {!isHome && (
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors text-slate-600 cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" />
          </button>
        )}
        <h1 className="text-base md:text-3xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h1>
      </div>
      <div className="text-right shrink-0">
        <Clock className="text-xl md:text-4xl font-black text-[#0056D2] tracking-tight" />
        <p className="hidden md:block text-base font-bold text-slate-500 uppercase mt-0.5">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </header>
  );
}
