'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { WhatsAppMessage, WhatsAppSendResult, WaEventType, PackageType, WaMessageStatus } from '@/types';

// ─── Generador de texto de mensajes ────────────────────────────────────────

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

// ─── Row mapping ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): WhatsAppMessage {
  return {
    id: row.id,
    apt: row.apt,
    text: row.text,
    sentAt: row.sent_at,
    packageId: row.package_id ?? '',
    eventType: row.event_type as WaEventType,
    phoneNumber: row.phone_number ?? undefined,
    waMessageId: row.wa_message_id ?? undefined,
    status: row.status as WaMessageStatus | undefined,
    mock: row.mock ?? undefined,
    direction: row.direction ?? 'outgoing',
  };
}

// ─── Hook principal ─────────────────────────────────────────────────────────

export function useWhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);

  // Fetch initial messages
  useEffect(() => {
    supabase
      .from('whatsapp_messages')
      .select('*')
      .order('sent_at', { ascending: true })
      .limit(500)
      .then(({ data }) => {
        if (data) setMessages(data.map(fromRow));
      });
  }, []);

  // Realtime subscription for incoming messages and status updates
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' },
        (payload) => {
          const msg = fromRow(payload.new);
          setMessages(prev => {
            // Avoid duplicates (optimistic add may already have it)
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'whatsapp_messages' },
        (payload) => {
          const updated = fromRow(payload.new);
          setMessages(prev =>
            prev.map(m => m.id === updated.id ? updated : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Mensajes agrupados por departamento
  const conversations = useMemo(() => {
    return messages.reduce<Record<string, WhatsAppMessage[]>>((acc, msg) => {
      if (!acc[msg.apt]) acc[msg.apt] = [];
      acc[msg.apt].push(msg);
      return acc;
    }, {});
  }, [messages]);

  // Lista de conversaciones para el panel izquierdo
  const conversationList = useMemo(() => {
    return Object.entries(conversations)
      .map(([apt, msgs]) => {
        const sorted = [...msgs].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        return { apt, lastMessage: sorted[0], count: msgs.length };
      })
      .sort((a, b) => new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime());
  }, [conversations]);

  // ─── sendAndRecord: envía via API + guarda en Supabase ──────────────────
  const sendAndRecord = async (
    data: Omit<WhatsAppMessage, 'id' | 'sentAt' | 'status' | 'waMessageId' | 'mock'> & {
      packageType?: string;
      buildingName?: string;
      provider?: string;
      note?: string;
      concierge?: string;
      deliveredTo?: string;
    }
  ): Promise<WhatsAppSendResult> => {
    const msgId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newMsg: WhatsAppMessage = {
      id: msgId,
      sentAt: now,
      status: 'sending',
      direction: 'outgoing',
      ...data,
    };

    // Optimistic: agregar inmediatamente
    setMessages(prev => [...prev, newMsg]);

    const isEnabled = process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'true';

    if (!isEnabled || !data.phoneNumber) {
      // Modo mock
      const mockMsg = { ...newMsg, status: 'sent' as const, mock: true };
      setMessages(prev => prev.map(m => m.id === msgId ? mockMsg : m));

      // Guardar en Supabase como mock
      supabase.from('whatsapp_messages').insert({
        id: msgId, apt: data.apt, text: data.text, sent_at: now,
        package_id: data.packageId || null, event_type: data.eventType,
        direction: 'outgoing', phone_number: data.phoneNumber,
        status: 'sent', mock: true,
      }).then();

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
          provider: data.provider,
          note: data.note,
          concierge: data.concierge,
          deliveredTo: data.deliveredTo,
        }),
      });

      const result: WhatsAppSendResult = await res.json();

      const updatedMsg = {
        ...newMsg,
        status: (result.success ? 'sent' : 'failed') as WaMessageStatus,
        waMessageId: result.messageId,
        mock: result.mock,
      };
      setMessages(prev => prev.map(m => m.id === msgId ? updatedMsg : m));

      // Guardar en Supabase
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
        direction: 'outgoing', phone_number: data.phoneNumber,
        status: 'failed', mock: false,
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
  }, []);

  return {
    messages,
    conversations,
    conversationList,
    sendAndRecord,
    getConversation,
    clearMessages,
  };
}

export type { WaEventType };
