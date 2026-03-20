'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { NotifyModal } from '@/components/ui/NotifyModal';
import { PackageForm } from '@/components/packages/PackageForm';
import { PackageCard } from '@/components/packages/PackageCard';
import { usePackages } from '@/hooks/usePackages';
import { useWhatsAppMessages, buildNotifyText, buildDeliveredText } from '@/hooks/useWhatsAppMessages';
import { useSettings } from '@/hooks/useSettings';
import { PackageType } from '@/types';
import { Package, MessageCircle } from 'lucide-react';

export default function PaquetesPage() {
  const { pendingPackages, deliveredPackages, addPackage, markDelivered, markNotified } = usePackages();
  const { addMessage, conversationList } = useWhatsAppMessages();
  const { settings } = useSettings();
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; apt: string; type: PackageType } | null>(null);

  const handleNotify = (id: string) => {
    const pkg = pendingPackages.find(p => p.id === id);
    if (pkg) setNotifyTarget({ id, apt: pkg.recipientApt, type: pkg.type });
  };

  const handleDeliver = (id: string) => {
    const pkg = pendingPackages.find(p => p.id === id);
    markDelivered(id);
    if (pkg) {
      addMessage({
        apt: pkg.recipientApt,
        text: buildDeliveredText(settings.buildingName),
        packageId: pkg.id,
        eventType: 'delivered',
      });
    }
  };

  const notifyMessageText = notifyTarget
    ? buildNotifyText(notifyTarget.type, settings.buildingName)
    : '';

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex gap-6 p-6">

        {/* Left: form panel */}
        <div className="w-80 shrink-0 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Registrar Paquete</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <PackageForm
              onSubmit={(data: { recipientApt: string; type: PackageType }) => addPackage(data)}
            />
          </div>
        </div>

        {/* Right: pending packages list */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">Paquetes Pendientes</h2>
              {pendingPackages.length > 0 && (
                <span className="bg-amber-500 text-white text-lg font-bold px-3 py-0.5 rounded-full">
                  {pendingPackages.length}
                </span>
              )}
            </div>
            <Link href="/whatsapp">
              <button className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                Ver conversaciones
                {conversationList.length > 0 && (
                  <span className="bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {conversationList.length}
                  </span>
                )}
              </button>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3">
            {pendingPackages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Package className="w-16 h-16 text-slate-300" />
                <p className="text-xl font-semibold">Sin paquetes pendientes</p>
              </div>
            ) : (
              pendingPackages.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onNotify={handleNotify}
                  onDeliver={handleDeliver}
                />
              ))
            )}

            {deliveredPackages.length > 0 && (
              <details className="bg-white rounded-2xl border border-slate-200 mt-2">
                <summary className="p-4 text-base font-semibold text-slate-500 cursor-pointer select-none">
                  Entregados hoy ({deliveredPackages.length})
                </summary>
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {deliveredPackages.slice(0, 20).map(pkg => (
                    <div key={pkg.id} className="py-2 border-b border-slate-100 last:border-0 flex justify-between">
                      <p className="font-semibold text-slate-700">Depto. {pkg.recipientApt}</p>
                      <p className="text-sm text-slate-400 self-center">
                        {new Date(pkg.deliveredAt!).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      {notifyTarget && (
        <NotifyModal
          isOpen={true}
          apt={notifyTarget.apt}
          messageText={notifyMessageText}
          onConfirm={() => markNotified(notifyTarget.id)}
          onMessageSent={() => addMessage({
            apt: notifyTarget.apt,
            text: notifyMessageText,
            packageId: notifyTarget.id,
            eventType: 'notify',
          })}
          onClose={() => setNotifyTarget(null)}
        />
      )}
    </AppShell>
  );
}
