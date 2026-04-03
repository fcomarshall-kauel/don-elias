'use client';
import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { WhatsAppMessage, WhatsAppSendResult, WaEventType, PackageType } from '@/types';

// ─── Generador de texto de mensajes ────────────────────────────────────────
// Estos textos se usan para la UI local (burbujas de chat).
// En producción, Meta envía el template aprobado (no este texto).

export function buildNotifyText(packageType: PackageType, buildingName: string): string {
  const footer = `\n\n_Recepcion — ${buildingName}_`;
  switch (packageType) {
    case 'food':
      return `⚠️ *Urgente:* tiene un pedido de *comida* esperandole en recepcion. Le pedimos retirarlo a la brevedad para evitar que se deteriore.${footer}`;
    case 'other':
      return `📄 Hola, tiene una *encomienda* en la recepcion de ${buildingName}. Puede retirarlo cuando guste.${footer}`;
    case 'supermercado':
      return `🛒 *Aviso:* tiene un pedido de *supermercado* en recepcion de ${buildingName}. Le sugerimos retirarlo pronto.${footer}`;
    default:
      return `📦 Hola, tiene un *paquete* en la recepcion de ${buildingName}. Favor retirarlo cuando pueda.${footer}`;
  }
}

export function buildDeliveredText(buildingName: string): string {
  return `✅ Su paquete fue *retirado exitosamente*. ¡Hasta pronto!\n\n_Recepcion — ${buildingName}_`;
}

// ─── Hook principal ─────────────────────────────────────────────────────────
export function useWhatsAppMessages() {
  const [messages, setMessages] = useLocalStorage<WhatsAppMessage[]>('porter_whatsapp', []);

  // Mensajes agrupados por departamento, ordenados cronologicamente
  const conversations = useMemo(() => {
    return messages.reduce<Record<string, WhatsAppMessage[]>>((acc, msg) => {
      if (!acc[msg.apt]) acc[msg.apt] = [];
      acc[msg.apt].push(msg);
      return acc;
    }, {});
  }, [messages]);

  // Lista de conversaciones para el panel izquierdo, ordenada por ultimo mensaje
  const conversationList = useMemo(() => {
    return Object.entries(conversations)
      .map(([apt, msgs]) => {
        const sorted = [...msgs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        return { apt, lastMessage: sorted[0], count: msgs.length };
      })
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
  }, [conversations]);

  // ─── addMessage: guarda localmente (sin enviar a API) ──────────────────
  // Se mantiene para compatibilidad y para el historial visual.
  const addMessage = (data: Omit<WhatsAppMessage, 'id' | 'sentAt'>) => {
    const newMsg: WhatsAppMessage = {
      id: crypto.randomUUID(),
      sentAt: new Date().toISOString(),
      ...data,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // ─── sendAndRecord: envía via API + guarda localmente ──────────────────
  // Flujo: optimistic add → API call → actualiza estado
  const sendAndRecord = async (
    data: Omit<WhatsAppMessage, 'id' | 'sentAt' | 'status' | 'waMessageId' | 'mock'> & {
      packageType?: string;
      buildingName?: string;
    }
  ): Promise<WhatsAppSendResult> => {
    const msgId = crypto.randomUUID();
    const newMsg: WhatsAppMessage = {
      id: msgId,
      sentAt: new Date().toISOString(),
      status: 'sending',
      ...data,
    };

    // Optimistic: agregar inmediatamente a localStorage
    setMessages(prev => [...prev, newMsg]);

    // Verificar si WhatsApp API esta habilitado
    const isEnabled = process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'true';

    if (!isEnabled || !data.phoneNumber) {
      // Modo mock: marcar como enviado sin API real
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId ? { ...m, status: 'sent' as const, mock: true } : m
        )
      );
      return { success: true, mock: true };
    }

    // Modo produccion: llamar a la API route
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.phoneNumber,
          apt: data.apt,
          eventType: data.eventType,
          packageId: data.packageId,
          packageType: data.packageType,
          buildingName: data.buildingName,
        }),
      });

      const result: WhatsAppSendResult = await res.json();

      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                status: result.success ? ('sent' as const) : ('failed' as const),
                waMessageId: result.messageId,
                mock: result.mock,
              }
            : m
        )
      );

      return result;
    } catch {
      // Error de red
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId ? { ...m, status: 'failed' as const } : m
        )
      );
      return { success: false, error: 'Error de conexion' };
    }
  };

  const getConversation = (apt: string): WhatsAppMessage[] => {
    return (conversations[apt] ?? []).slice().sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  };

  return {
    messages,
    conversations,
    conversationList,
    addMessage,
    sendAndRecord,
    getConversation,
  };
}

// Re-export helpers for use in paquetes/page
export type { WaEventType };
