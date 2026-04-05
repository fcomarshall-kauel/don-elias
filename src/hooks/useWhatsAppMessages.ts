'use client';
import { useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useDataContext } from '@/providers/DataProvider';
import { WhatsAppMessage, WhatsAppSendResult, WaEventType, WaMessageStatus, PackageType } from '@/types';

// ─── Text builders ──────────────────────────────────────────────────────

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

// ─── Hook ───────────────────────────────────────────────────────────────

export function useWhatsAppMessages() {
  const { messages, setMessages } = useDataContext();

  const conversations = useMemo(() => {
    return messages.reduce<Record<string, WhatsAppMessage[]>>((acc, msg) => {
      if (!acc[msg.apt]) acc[msg.apt] = [];
      acc[msg.apt].push(msg);
      return acc;
    }, {});
  }, [messages]);

  const conversationList = useMemo(() => {
    return Object.entries(conversations)
      .map(([apt, msgs]) => {
        const sorted = [...msgs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        return { apt, lastMessage: sorted[0], count: msgs.length };
      })
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
  }, [conversations]);

  const sendAndRecord = async (
    data: Omit<WhatsAppMessage, 'id' | 'sentAt' | 'status' | 'waMessageId' | 'mock'> & {
      packageType?: string; buildingName?: string; provider?: string;
      note?: string; concierge?: string; deliveredTo?: string;
    }
  ): Promise<WhatsAppSendResult> => {
    const msgId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newMsg: WhatsAppMessage = { id: msgId, sentAt: now, status: 'sending', direction: 'outgoing', ...data };

    setMessages(prev => [...prev, newMsg]);

    const isEnabled = process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'true';

    if (!isEnabled || !data.phoneNumber) {
      const mockMsg = { ...newMsg, status: 'sent' as const, mock: true };
      setMessages(prev => prev.map(m => m.id === msgId ? mockMsg : m));
      supabase.from('whatsapp_messages').insert({
        id: msgId, apt: data.apt, text: data.text, sent_at: now,
        package_id: data.packageId || null, event_type: data.eventType,
        direction: 'outgoing', phone_number: data.phoneNumber, status: 'sent', mock: true,
      }).then();
      return { success: true, mock: true };
    }

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.phoneNumber, apt: data.apt, eventType: data.eventType,
          packageId: data.packageId, packageType: data.packageType,
          buildingName: data.buildingName, provider: data.provider,
          note: data.note, concierge: data.concierge, deliveredTo: data.deliveredTo,
        }),
      });
      const result: WhatsAppSendResult = await res.json();
      const updatedMsg = {
        ...newMsg,
        status: (result.success ? 'sent' : 'failed') as WaMessageStatus,
        waMessageId: result.messageId, mock: result.mock,
      };
      setMessages(prev => prev.map(m => m.id === msgId ? updatedMsg : m));
      supabase.from('whatsapp_messages').insert({
        id: msgId, apt: data.apt, text: data.text, sent_at: now,
        package_id: data.packageId || null, event_type: data.eventType,
        direction: 'outgoing', phone_number: data.phoneNumber,
        wa_message_id: result.messageId, status: result.success ? 'sent' : 'failed',
        mock: result.mock ?? false,
      }).then();
      return result;
    } catch {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'failed' as const } : m));
      supabase.from('whatsapp_messages').insert({
        id: msgId, apt: data.apt, text: data.text, sent_at: now,
        package_id: data.packageId || null, event_type: data.eventType,
        direction: 'outgoing', phone_number: data.phoneNumber, status: 'failed', mock: false,
      }).then();
      return { success: false, error: 'Error de conexion' };
    }
  };

  const getConversation = useCallback((apt: string): WhatsAppMessage[] => {
    return (conversations[apt] ?? []).slice().sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }, [conversations]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    supabase.from('whatsapp_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000').then();
  }, [setMessages]);

  return { messages, conversations, conversationList, sendAndRecord, getConversation, clearMessages };
}

export type { WaEventType };
