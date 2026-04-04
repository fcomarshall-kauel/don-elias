'use client';
import { useEffect, useRef } from 'react';
import { Check, CheckCheck, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { WhatsAppMessage, WaMessageStatus } from '@/types';
import { getResidentsByApt } from '@/data/residents';

interface ChatViewProps {
  apt: string;
  messages: WhatsAppMessage[];
}

function StatusIcon({ status, mock }: { status?: WaMessageStatus; mock?: boolean }) {
  if (mock) return <Clock className="w-3 h-3 text-[#8696a0]" />;
  switch (status) {
    case 'sent':
      return <Check className="w-3 h-3 text-[#8696a0]" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-[#8696a0]" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-[#53bdeb]" />;
    case 'failed':
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    case 'sending':
      return <Clock className="w-3 h-3 text-[#8696a0] animate-pulse" />;
    default:
      return <Check className="w-3 h-3 text-[#8696a0]" />;
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function EventBadge({ type }: { type: string }) {
  if (type === 'notify') return <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Notificacion</span>;
  if (type === 'delivered') return <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Entrega</span>;
  return null;
}

export function ChatView({ apt, messages }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const residents = getResidentsByApt(apt);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <p>Sin mensajes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#f0f2f5] border-b border-slate-200 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white text-sm font-bold">
          {apt}
        </div>
        <div>
          <p className="font-semibold text-slate-800">Depto. {apt}</p>
          {residents.length > 0 && (
            <p className="text-xs text-slate-500">
              {residents.slice(0, 3).join(', ')}
              {residents.length > 3 && ` +${residents.length - 3}`}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4"
        style={{ backgroundColor: '#efeae2', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {messages.map(msg => {
            const isIncoming = msg.direction === 'incoming';
            return (
              <div key={msg.id} className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}>
                <div className={`${isIncoming ? 'bg-white' : 'bg-[#d9fdd3]'} rounded-lg px-3 py-2 max-w-[85%] shadow-sm`}>
                  {!isIncoming && <EventBadge type={msg.eventType} />}
                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                    {msg.text.replace(/\*/g, '').replace(/_/g, '')}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#667781]">{formatTime(msg.sentAt)}</span>
                    {!isIncoming && <StatusIcon status={msg.status} mock={msg.mock} />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

export function EmptyChatView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-slate-400 gap-4">
      <MessageCircle className="w-20 h-20 text-slate-300" />
      <div className="text-center">
        <p className="text-xl font-semibold text-slate-500">Mensajes WhatsApp</p>
        <p className="text-sm mt-1">Selecciona una conversacion para ver los mensajes</p>
      </div>
    </div>
  );
}
