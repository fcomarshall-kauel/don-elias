'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Package, BookOpen, RefreshCw } from 'lucide-react';

const tabs = [
  { href: '/',          label: 'Inicio',    icon: Home },
  { href: '/visitas',   label: 'Visitas',   icon: Users },
  { href: '/paquetes',  label: 'Paquetes',  icon: Package },
  { href: '/novedades', label: 'Novedades', icon: BookOpen },
  { href: '/turno',     label: 'Turno',     icon: RefreshCw },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-16
                transition-colors
                ${isActive
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
