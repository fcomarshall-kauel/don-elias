'use client';
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { NotifyModal } from '@/components/ui/NotifyModal';
import { AutoNotifyPrompt } from '@/components/packages/AutoNotifyPrompt';
import { PackageForm } from '@/components/packages/PackageForm';
import { PackageCard } from '@/components/packages/PackageCard';
import { NumpadModal } from '@/components/packages/NumpadModal';
import { ProviderModal } from '@/components/packages/ProviderModal';
import { DeliveryModal } from '@/components/packages/DeliveryModal';
import { VoiceButton } from '@/components/packages/VoiceButton';
import { usePackages } from '@/hooks/usePackages';
import { useWhatsAppMessages, buildNotifyText, buildDeliveredText } from '@/hooks/useWhatsAppMessages';
import { useSettings } from '@/hooks/useSettings';
import { useSeenMessages } from '@/hooks/useSeenMessages';
import { useProviders } from '@/hooks/useProviders';
import { useResidents } from '@/hooks/useResidents';
import { getPhonesByApt } from '@/data/residents';
import { PackageType } from '@/types';
import { VoiceCommand } from '@/lib/voiceParser';
import { Package as PkgIcon, MessageCircle } from 'lucide-react';

export default function PaquetesPage() {
  const { pendingPackages, deliveredPackages, addPackage, markDelivered, markNotified } = usePackages();
  const { messages, sendAndRecord, conversationList } = useWhatsAppMessages();
  const { settings } = useSettings();
  const { getLastSeen } = useSeenMessages();
  const { getByType } = useProviders();
  const { getByApt: getByAptDB, getPhonesByApt: getPhonesByAptDB } = useResidents();

  // Use DB phones first, fallback to hardcoded
  const getPhones = (apt: string) => {
    const dbPhones = getPhonesByAptDB(apt);
    return dbPhones.length > 0 ? dbPhones : getPhonesByApt(apt);
  };

  // Flujo de registro: tipo → numpad → proveedor
  const [selectedType, setSelectedType] = useState<PackageType | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{ recipientApt: string; type: PackageType } | null>(null);
  const [newPkgId, setNewPkgId] = useState<string | null>(null);

  // Auto-notificacion post-registro
  const [autoNotifyTarget, setAutoNotifyTarget] = useState<{ id: string; apt: string; type: PackageType } | null>(null);

  // Flujo de entrega y notificacion
  const [deliverTarget, setDeliverTarget] = useState<{ apt: string; packageIds: string[] } | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<{ id: string; apt: string; type: PackageType; provider?: string; note?: string } | null>(null);

  // Group pending packages by apt
  const groupedByApt = useMemo(() => {
    const groups: Record<string, typeof pendingPackages> = {};
    for (const pkg of pendingPackages) {
      if (!groups[pkg.recipientApt]) groups[pkg.recipientApt] = [];
      groups[pkg.recipientApt].push(pkg);
    }
    return Object.entries(groups).sort(([, a], [, b]) => {
      const latestA = Math.max(...a.map(p => new Date(p.receivedAt).getTime()));
      const latestB = Math.max(...b.map(p => new Date(p.receivedAt).getTime()));
      return latestB - latestA;
    });
  }, [pendingPackages]);

  // Paso 1: selecciona tipo → abre numpad
  const handleSelectType = (type: PackageType) => setSelectedType(type);

  // Paso 2: numpad confirma depto → abre proveedor
  const handleNumpadConfirm = (apt: string) => {
    if (!selectedType) return;
    setPendingRegistration({ recipientApt: apt, type: selectedType });
    setSelectedType(null);
  };

  // Paso 3: proveedor confirma → registra → muestra auto-notify
  const handleProviderConfirm = (provider?: string, note?: string) => {
    if (!pendingRegistration) return;
    const id = addPackage({
      ...pendingRegistration,
      provider,
      note,
      receivedBy: settings.conciergerName,
    });
    const { recipientApt, type } = pendingRegistration;
    setPendingRegistration(null);
    setNewPkgId(id);
    setTimeout(() => setNewPkgId(null), 2000);
    setAutoNotifyTarget({ id, apt: recipientApt, type });
  };

  // Auto-notify: usuario confirma → abrir NotifyModal
  const handleAutoNotifyConfirm = () => {
    if (!autoNotifyTarget) return;
    const { id, apt, type } = autoNotifyTarget;
    setAutoNotifyTarget(null);
    // Find the package to get provider/note
    const pkg = pendingPackages.find(p => p.id === id);
    setNotifyTarget({ id, apt, type, provider: pkg?.provider, note: pkg?.note });
  };

  const handleAutoNotifyDismiss = useCallback(() => {
    setAutoNotifyTarget(null);
  }, []);

  // Comando de voz
  const handleVoiceCommand = (command: VoiceCommand) => {
    if (command.action === 'register') {
      const type = command.type ?? 'normal';
      if (command.apt) {
        setPendingRegistration({ recipientApt: command.apt, type });
      } else {
        setSelectedType(type);
      }
    } else if (command.action === 'deliver' && command.apt) {
      const pkgs = pendingPackages.filter(p => p.recipientApt === command.apt);
      if (pkgs.length > 0) {
        setDeliverTarget({ apt: command.apt, packageIds: pkgs.map(p => p.id) });
      }
    }
  };

  // Deliver from grouped card
  const handleDeliver = (apt: string, packageIds: string[]) => {
    setDeliverTarget({ apt, packageIds });
  };

  const confirmDelivery = (deliveredTo: string, packageIds: string[]) => {
    if (!deliverTarget) return;
    markDelivered(packageIds, deliveredTo);
    // Send delivery notification for first package
    const phones = getPhones(deliverTarget.apt);
    if (phones[0]) {
      sendAndRecord({
        apt: deliverTarget.apt,
        text: buildDeliveredText(settings.buildingName),
        packageId: packageIds[0],
        eventType: 'delivered',
        phoneNumber: phones[0],
        buildingName: settings.buildingName,
        deliveredTo,
        concierge: settings.conciergerName,
      });
    }
    setDeliverTarget(null);
  };

  const notifyMessageText = notifyTarget
    ? buildNotifyText(notifyTarget.type, settings.buildingName)
    : '';

  // Get packages for delivery modal
  const deliverPackages = deliverTarget
    ? pendingPackages.filter(p => deliverTarget.packageIds.includes(p.id))
    : [];

  return (
    <AppShell>
      <div className="flex-1 md:overflow-hidden flex flex-col md:flex-row gap-3 md:gap-6 p-3 md:p-6 overflow-y-auto">

        {/* Left: type selector */}
        <div className="w-full md:w-72 shrink-0 bg-white rounded-2xl md:rounded-3xl shadow-md border border-slate-200 flex flex-col md:overflow-hidden">
          <div className="p-3 md:p-5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800">Registrar</h2>
          </div>
          <div className="md:flex-1 md:overflow-y-auto p-3 md:p-5">
            <PackageForm onSelectType={handleSelectType} />
          </div>
        </div>

        {/* Right: pending packages grid (grouped by apt) */}
        <div className="flex-1 flex flex-col md:overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-3 md:mb-4 shrink-0 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 truncate">Pendientes</h2>
              {pendingPackages.length > 0 && (
                <span className="bg-amber-500 text-white text-sm md:text-lg font-bold px-2 md:px-3 py-0.5 rounded-full shrink-0">
                  {pendingPackages.length}
                </span>
              )}
            </div>
            <Link href="/mensajes?from=paquetes">
              <button className="flex items-center gap-1 md:gap-2 bg-[#25D366] hover:bg-[#1da851] text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm transition-colors cursor-pointer">
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Ver conversaciones</span>
                <span className="md:hidden">Mensajes</span>
                {conversationList.length > 0 && (
                  <span className="bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {conversationList.length}
                  </span>
                )}
              </button>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            {groupedByApt.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <PkgIcon className="w-16 h-16 text-slate-300" />
                <p className="text-xl font-semibold">Sin paquetes pendientes</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-start content-start">
                {groupedByApt.map(([apt, pkgs]) => (
                  <div key={apt} className="w-[calc(50%-4px)] sm:w-48">
                    <PackageCard
                      apt={apt}
                      packages={pkgs}
                      messages={messages}
                      isNew={newPkgId}
                      lastSeenAt={getLastSeen(apt)}
                      phoneNumber={getPhones(apt)[0]}
                      onDeliver={handleDeliver}
                    />
                  </div>
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
          providerNames={getByType(pendingRegistration.type)}
          onConfirm={handleProviderConfirm}
          onClose={() => setPendingRegistration(null)}
        />
      )}

      {/* Modal: auto-notificacion post-registro */}
      {autoNotifyTarget && (() => {
        const aptResidents = getByAptDB(autoNotifyTarget.apt);
        const contactMethod = aptResidents[0]?.contactForPackages ?? 'citofono';
        const phones = getPhones(autoNotifyTarget.apt);
        return (
          <AutoNotifyPrompt
            isOpen={true}
            apt={autoNotifyTarget.apt}
            packageType={autoNotifyTarget.type}
            contactMethod={contactMethod}
            hasPhone={phones.length > 0}
            phoneNumber={phones[0]}
            residentNames={aptResidents.map(r => r.name)}
            onConfirmWhatsApp={handleAutoNotifyConfirm}
            onDismiss={handleAutoNotifyDismiss}
          />
        );
      })()}

      {/* Modal: entrega con checkboxes */}
      {deliverTarget && deliverPackages.length > 0 && (
        <DeliveryModal
          isOpen={true}
          apt={deliverTarget.apt}
          packages={deliverPackages}
          residentNames={getByAptDB(deliverTarget.apt).map(r => r.name)}
          onConfirm={confirmDelivery}
          onClose={() => setDeliverTarget(null)}
        />
      )}

      {/* Modal: notificacion WhatsApp */}
      {notifyTarget && (
        <NotifyModal
          isOpen={true}
          apt={notifyTarget.apt}
          messageText={notifyMessageText}
          onConfirm={() => markNotified(notifyTarget.id)}
          onSend={async () => {
            const phones = getPhones(notifyTarget.apt);
            return sendAndRecord({
              apt: notifyTarget.apt,
              text: notifyMessageText,
              packageId: notifyTarget.id,
              eventType: 'notify',
              phoneNumber: phones[0],
              packageType: notifyTarget.type,
              buildingName: settings.buildingName,
              provider: notifyTarget.provider,
              note: notifyTarget.note,
              concierge: settings.conciergerName,
            });
          }}
          onClose={() => setNotifyTarget(null)}
        />
      )}
      <VoiceButton onCommand={handleVoiceCommand} />
    </AppShell>
  );
}
