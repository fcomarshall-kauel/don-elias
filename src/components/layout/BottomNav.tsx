'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Package, MessageCircle, BookOpen, RefreshCw, Settings, MoreHorizontal } from 'lucide-react';

const primaryTabs = [
  { href: '/',          label: 'Inicio',    icon: Home },
  { href: '/visitas',   label: 'Visitas',   icon: Users },
  { href: '/paquetes',  label: 'Paquetes',  icon: Package },
  { href: '/mensajes',  label: 'Mensajes',  icon: MessageCircle },
];

const secondaryTabs = [
  { href: '/novedades', label: 'Novedades', icon: BookOpen },
  { href: '/turno',     label: 'Turno',     icon: RefreshCw },
  { href: '/admin',     label: 'Admin',     icon: Settings },
];

const allTabs = [...primaryTabs, ...secondaryTabs];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  // Check if current page is in secondary (so "Más" tab shows as active)
  const isOnSecondary = secondaryTabs.some(t => t.href === pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg">
      {/* Mobile: 4 primary + Más */}
      <div className="flex md:hidden">
        {primaryTabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-16 transition-colors ${
                isActive ? 'bg-[#1e3a5f] text-white' : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <div className="flex-1 relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`w-full h-full flex flex-col items-center justify-center py-2 gap-1 min-h-16 transition-colors ${
              isOnSecondary || moreOpen ? 'bg-[#1e3a5f] text-white' : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">Más</span>
          </button>
          {moreOpen && (
            <div className="absolute bottom-full right-0 mb-2 mr-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden min-w-[160px]">
              {secondaryTabs.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive ? 'bg-[#1e3a5f] text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-semibold">{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tablet+: all 7 tabs visible */}
      <div className="hidden md:flex">
        {allTabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 min-h-16 transition-colors ${
                isActive ? 'bg-[#1e3a5f] text-white' : 'text-slate-500 hover:bg-slate-50 active:bg-slate-100'
              }`}
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
