'use client';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useResidents } from '@/hooks/useResidents';
import { useConcierges } from '@/hooks/useConcierges';
import { useProviders } from '@/hooks/useProviders';
import { Building2, Users, HardHat, Package, MessageCircle, QrCode, Settings } from 'lucide-react';

const cards = [
  { href: '/admin/edificio',     icon: Building2,     label: 'Edificio',     color: 'bg-blue-500',   countKey: 'building' },
  { href: '/admin/residentes',   icon: Users,         label: 'Residentes',   color: 'bg-green-500',  countKey: 'residents' },
  { href: '/admin/conserjes',    icon: HardHat,       label: 'Conserjes',    color: 'bg-amber-500',  countKey: 'concierges' },
  { href: '/admin/proveedores',  icon: Package,       label: 'Proveedores',  color: 'bg-purple-500', countKey: 'providers' },
  { href: '/admin/whatsapp',     icon: MessageCircle, label: 'WhatsApp',     color: 'bg-[#25D366]',  countKey: 'whatsapp' },
  { href: '/admin/qr',           icon: QrCode,        label: 'QR Residentes',color: 'bg-slate-600',  countKey: 'qr' },
];

export default function AdminPage() {
  const { residents } = useResidents();
  const { activeConcierges } = useConcierges();
  const { providers } = useProviders();

  const uniqueApts = new Set(residents.map(r => r.apt)).size;

  const counts: Record<string, string> = {
    building: 'Configuración',
    residents: `${uniqueApts} deptos · ${residents.length} personas`,
    concierges: `${activeConcierges.length} activos`,
    providers: `${providers.length} proveedores`,
    whatsapp: 'Estado',
    qr: 'Generar',
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-slate-600" />
            <h1 className="text-3xl font-extrabold text-slate-800">Configuración del Edificio</h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(({ href, icon: Icon, label, color, countKey }) => (
              <Link key={href} href={href}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{label}</h3>
                  <p className="text-sm text-slate-400 mt-1">{counts[countKey]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
