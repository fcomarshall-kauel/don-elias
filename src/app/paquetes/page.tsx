'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { NotifyModal } from '@/components/ui/NotifyModal';
import { PackageForm } from '@/components/packages/PackageForm';
import { PackageCard } from '@/components/packages/PackageCard';
import { NumpadModal } from '@/components/packages/NumpadModal';
import { ProviderModal } from '@/components/packages/ProviderModal';
import { DeliveryModal } from '@/components/packages/DeliveryModal';
import { VoiceButton } from '@/components/packages/VoiceButton';
import { usePackages } from '@/hooks/usePackages';
import { useWhatsAppMessages, buildNotifyText, buildDeliveredText } from '@/hooks/useWhatsAppMessages';
import { useSettings } from '@/hooks/useSettings';
import { PackageType } from '@/types';
import { VoiceCommand } from '@/lib/voiceParser';
import { Package, MessageCircle } from 'lucide-react';

export default function PaquetesPage() {
  const { pendingPackages, deliveredPackages, addPackage, markDelivered, markNotified } = usePackages();
  const { addMessage, conversationList } = useWhatsAppMessages();
  const { settings } = useSettings();

  // Flujo de registro: tipo → numpad → proveedor
  const [selectedType, setSelectedType] = useState<PackageType | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ recipientApt: string; type: PackageType } | null>(null);
  const [newPkgId, setNewPkgId] = useState<string | null>(null);

  // Flujo de entrega
  const [deliverTarget, setDeliverTarget] = useState<{ id: string; apt: string } | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; apt: string; type: PackageType } | null>(null);

  // Paso 1: selecciona tipo → abre numpad
  const handleSelectType = (type: PackageType) => {
    setSelectedType(type);
  };

  // Paso 2: numpad confirma depto → abre proveedor
  const handleNumpadConfirm = (apt: string) => {
    if (!selectedType) return;
    setPendingRegistration({ recipientApt: apt, type: selectedType });
    setSelectedType(null);
  };

  // Paso 3: proveedor confirma → registra
  const handleProviderConfirm = (provider?: string, note?: string) => {
    if (!pendingRegistration) return;
    const id = addPackage({
      ...pendingRegistration,
      provider,
      note,
      receivedBy: settings.conciergerName,
    });
    setPendingRegistration(null);
    setNewPkgId(id);
    setTimeout(() => setNewPkgId(null), 2000);
  };

  // Comando de voz
  const handleVoiceCommand = (command: VoiceCommand) => {
    if (command.action === 'register') {
      const type = command.type ?? 'normal';
      if (command.apt) {
        // Tiene tipo + depto → directo al modal de proveedor
        setPendingRegistration({ recipientApt: command.apt, type });
      } else {
        // Solo tipo → abre numpad
        setSelectedType(type);
      }
    } else if (command.action === 'deliver' && command.apt) {
      // Buscar paquete pendiente para ese depto
      const pkg = pendingPackages.find(p => p.recipientApt === command.apt);
      if (pkg) setDeliverTarget({ id: pkg.id, apt: pkg.recipientApt });
    }
  };

  const handleNotify = (id: string) => {
    const pkg = pendingPackages.find(p => p.id === id);
    if (pkg) setNotifyTarget({ id, apt: pkg.recipientApt, type: pkg.type });
  };

  const handleDeliver = (id: string) => {
    const pkg = pendingPackages.find(p => p.id === id);
    if (pkg) setDeliverTarget({ id, apt: pkg.recipientApt });
  };

  const confirmDelivery = (deliveredTo: string) => {
    if (!deliverTarget) return;
    const pkg = pendingPackages.find(p => p.id === deliverTarget.id);
    markDelivered(deliverTarget.id, deliveredTo);
    if (pkg) {
      addMessage({
        apt: pkg.recipientApt,
        text: buildDeliveredText(settings.buildingName),
        packageId: pkg.id,
        eventType: 'delivered',
      });
    }
    setDeliverTarget(null);
  };

  const notifyMessageText = notifyTarget
    ? buildNotifyText(notifyTarget.type, settings.buildingName)
    : '';

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex gap-6 p-6">

        {/* Left: type selector */}
        <div className="w-72 shrink-0 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-2xl font-bold text-slate-800">Registrar</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <PackageForm onSelectType={handleSelectType} />
          </div>
        </div>

        {/* Right: pending packages grid */}
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

          <div className="flex-1 overflow-y-auto">
            {pendingPackages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <Package className="w-16 h-16 text-slate-300" />
                <p className="text-xl font-semibold">Sin paquetes pendientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {pendingPackages.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isNew={pkg.id === newPkgId}
                    onNotify={handleNotify}
                    onDeliver={handleDeliver}
                  />
                ))}
              </div>
            )}

            {deliveredPackages.length > 0 && (
              <details className="bg-white rounded-2xl border border-slate-200 mt-4">
                <summary className="p-4 text-base font-semibold text-slate-500 cursor-pointer select-none">
                  Entregados hoy ({deliveredPackages.length})
                </summary>
                <div className="px-4 pb-4 grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-1">
                  {deliveredPackages.slice(0, 20).map(pkg => (
                    <div key={pkg.id} className="py-2 border-b border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">Depto. {pkg.recipientApt}</p>
                        {pkg.deliveredTo && (
                          <p className="text-xs text-slate-400">Retirado por: {pkg.deliveredTo}</p>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
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

      {/* Modal 1: Numpad para departamento */}
      {selectedType && (
        <NumpadModal
          isOpen={true}
          type={selectedType}
          onConfirm={handleNumpadConfirm}
          onClose={() => setSelectedType(null)}
        />
      )}

      {/* Modal 2: Proveedor + nota */}
      {pendingRegistration && (
        <ProviderModal
          isOpen={true}
          apt={pendingRegistration.recipientApt}
          type={pendingRegistration.type}
          onConfirm={handleProviderConfirm}
          onClose={() => setPendingRegistration(null)}
        />
      )}

      {/* Modal: entrega */}
      {deliverTarget && (
        <DeliveryModal
          isOpen={true}
          apt={deliverTarget.apt}
          onConfirm={confirmDelivery}
          onClose={() => setDeliverTarget(null)}
        />
      )}

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
      <VoiceButton onCommand={handleVoiceCommand} />
    </AppShell>
  );
}
