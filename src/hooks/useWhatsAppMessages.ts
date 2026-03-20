'use client';
import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { WhatsAppMessage, WaEventType, PackageType } from '@/types';

// ─── Generador de texto de mensajes ────────────────────────────────────────
// En producción, estos textos se enviarían como plantillas aprobadas por Meta
// (WhatsApp Business Template Messages) para poder iniciar conversaciones.

export function buildNotifyText(packageType: PackageType, buildingName: string): string {
  const footer = `\n\n_Recepción — ${buildingName}_`;
  switch (packageType) {
    case 'food':
      return `⚠️ *Urgente:* tiene un pedido de *comida* esperándole en recepción. Le pedimos retirarlo a la brevedad para evitar que se deteriore.${footer}`;
    case 'document':
      return `📄 Hola, tiene un *documento* en la recepción de ${buildingName}. Puede retirarlo cuando guste.${footer}`;
    default:
      return `📦 Hola, tiene un *paquete* en la recepción de ${buildingName}. Favor retirarlo cuando pueda.${footer}`;
  }
}

export function buildDeliveredText(buildingName: string): string {
  return `✅ Su paquete fue *retirado exitosamente*. ¡Hasta pronto!\n\n_Recepción — ${buildingName}_`;
}

// ─── Hook principal ─────────────────────────────────────────────────────────
export function useWhatsAppMessages() {
  const [messages, setMessages] = useLocalStorage<WhatsAppMessage[]>('porter_whatsapp', []);

  // Mensajes agrupados por departamento, ordenados cronológicamente
  const conversations = useMemo(() => {
    return messages.reduce<Record<string, WhatsAppMessage[]>>((acc, msg) => {
      if (!acc[msg.apt]) acc[msg.apt] = [];
      acc[msg.apt].push(msg);
      return acc;
    }, {});
  }, [messages]);

  // Lista de conversaciones para el panel izquierdo, ordenada por último mensaje
  const conversationList = useMemo(() => {
    return Object.entries(conversations)
      .map(([apt, msgs]) => {
        const sorted = [...msgs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        return { apt, lastMessage: sorted[0], count: msgs.length };
      })
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
  }, [conversations]);

  const addMessage = (data: Omit<WhatsAppMessage, 'id' | 'sentAt'>) => {
    // PRODUCCIÓN: aquí iría la llamada real antes de guardar en local:
    //
    // await fetch('/api/whatsapp/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: `56${data.phoneNumber}`,   // ej: "56912345678"
    //     message: data.text,
    //     packageId: data.packageId,     // para idempotencia en el webhook
    //   }),
    // });
    //
    // El endpoint Next.js /api/whatsapp/send llamaría a:
    // POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
    // Authorization: Bearer {WHATSAPP_TOKEN}
    // Body: { messaging_product: "whatsapp", to: "56...", type: "text", text: { body: "..." } }

    const newMsg: WhatsAppMessage = {
      id: crypto.randomUUID(),
      sentAt: new Date().toISOString(),
      ...data,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const getConversation = (apt: string): WhatsAppMessage[] => {
    return (conversations[apt] ?? []).slice().sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  };

  return { messages, conversations, conversationList, addMessage, getConversation };
}

// Re-export helpers for use in paquetes/page
export type { WaEventType };
