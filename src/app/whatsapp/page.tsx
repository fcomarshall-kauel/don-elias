'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useSettings } from '@/hooks/useSettings';
import { ChevronLeft, Search, MessageCircle, Check } from 'lucide-react';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'HOY';
  if (d.toDateString() === yesterday.toDateString()) return 'AYER';
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' }).toUpperCase();
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center my-3">
      <span className="bg-[#D1E7DD] text-[#1a6641] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
        {label}
      </span>
    </div>
  );
}

function MessageBubble({ text, time, isDelivered }: { text: string; time: string; isDelivered: boolean }) {
  // Render WhatsApp-style bold (*text*) and italic (_text_)
  const renderText = (raw: string) => {
    return raw.split('\n').map((line, i) => {
      const parts = line
        .split(/(\*[^*]+\*|_[^_]+_)/g)
        .map((part, j) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return <strong key={j}>{part.slice(1, -1)}</strong>;
          }
          if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={j} className="text-slate-500">{part.slice(1, -1)}</em>;
          }
          return <span key={j}>{part}</span>;
        });
      return <span key={i}>{parts}{i < raw.split('\n').length - 1 && <br />}</span>;
    });
  };

  return (
    <div className="flex justify-end px-4">
      <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] shadow-sm relative">
        <p className="text-slate-800 text-base leading-relaxed">{renderText(text)}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs text-slate-400">{time}</span>
          {/* Doble check azul (leído) */}
          <span className="flex items-center">
            <Check className="w-3 h-3 text-[#53bdeb] -mr-1.5" strokeWidth={3} />
            <Check className="w-3 h-3 text-[#53bdeb]" strokeWidth={3} />
          </span>
        </div>
        {/* Cola de la burbuja */}
        <div className="absolute top-0 right-0 translate-x-[6px]">
          <svg width="8" height="13" viewBox="0 0 8 13">
            <path d="M 0 0 Q 8 0 8 13 L 0 0" fill="#DCF8C6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppPage() {
  const { conversationList, getConversation } = useWhatsAppMessages();
  const { settings } = useSettings();
  const [selectedApt, setSelectedApt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = selectedApt ? getConversation(selectedApt) : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedApt]);

  // Group messages by date for separators
  const groupedMessages = messages.reduce<{ date: string; items: typeof messages }[]>((groups, msg) => {
    const dateLabel = formatDate(msg.sentAt);
    const last = groups[groups.length - 1];
    if (last && last.date === dateLabel) {
      last.items.push(msg);
    } else {
      groups.push({ date: dateLabel, items: [msg] });
    }
    return groups;
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col" style={{ background: '#ECE5DD' }}>

      {/* WhatsApp header */}
      <header className="shrink-0 flex items-center gap-4 px-5 py-4" style={{ background: '#075E54' }}>
        <Link href="/paquetes">
          <button className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-7 h-7" />
          </button>
        </Link>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg leading-tight">PorterOS</p>
          <p className="text-white/70 text-sm">Notificaciones a residentes · {settings.buildingName}</p>
        </div>
        <div className="text-white/60 text-xs text-right">
          <p>🔒 Cifrado extremo a extremo</p>
          <p className="text-white/40">mockup — sin envío real</p>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 overflow-hidden flex">

        {/* Left: conversation list */}
        <div className="w-80 shrink-0 bg-white flex flex-col border-r border-slate-200 overflow-hidden">
          {/* Search bar (decorative) */}
          <div className="p-3 shrink-0 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Buscar o iniciar chat</span>
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {conversationList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 px-6 text-center">
                <MessageCircle className="w-12 h-12 text-slate-300" />
                <p className="font-semibold">Sin conversaciones</p>
                <p className="text-sm">Las notificaciones enviadas a residentes aparecerán aquí</p>
              </div>
            ) : (
              conversationList.map(({ apt, lastMessage, count }) => (
                <button
                  key={apt}
                  onClick={() => setSelectedApt(apt)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer border-b border-slate-100 text-left ${
                    selectedApt === apt ? 'bg-[#F0F7F0]' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-black text-white text-lg" style={{ background: '#25D366' }}>
                    {apt.length <= 3 ? apt : apt.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-slate-900">Depto. {apt}</p>
                      <p className="text-xs text-slate-400 shrink-0">{formatTime(lastMessage.sentAt)}</p>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {lastMessage.text.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1').split('\n')[0]}
                    </p>
                    <span className="inline-block text-xs text-slate-400 mt-0.5">
                      {count} mensaje{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: chat window */}
        {selectedApt ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="shrink-0 flex items-center gap-3 px-5 py-3" style={{ background: '#075E54' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white" style={{ background: '#25D366' }}>
                {selectedApt.length <= 3 ? selectedApt : selectedApt.slice(0, 3)}
              </div>
              <div>
                <p className="text-white font-bold">Depto. {selectedApt}</p>
                <p className="text-white/70 text-sm">en línea</p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto py-4 flex flex-col gap-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5b8a8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                background: '#ECE5DD',
              }}
            >
              {groupedMessages.map(({ date, items }) => (
                <div key={date}>
                  <DateSeparator label={date} />
                  {items.map(msg => (
                    <div key={msg.id} className="mb-2">
                      <MessageBubble
                        text={msg.text}
                        time={formatTime(msg.sentAt)}
                        isDelivered={msg.eventType === 'delivered'}
                      />
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar (disabled) */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-[#F0F0F0]">
              <div className="flex-1 bg-white rounded-full px-5 py-3 text-slate-400 text-base select-none">
                Solo lectura — historial de notificaciones enviadas
              </div>
            </div>
          </div>
        ) : (
          /* Empty state when no chat selected */
          <div className="flex-1 flex flex-col items-center justify-center gap-5" style={{ background: '#ECE5DD' }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-2xl font-bold text-slate-700">Historial de notificaciones</p>
              <p className="text-slate-500 mt-2 text-base leading-relaxed">
                Selecciona un departamento para ver las notificaciones enviadas
              </p>
            </div>
            <div className="bg-white rounded-2xl px-6 py-4 text-sm text-slate-500 max-w-xs text-center border border-slate-200">
              🔒 <strong>Cifrado extremo a extremo</strong><br />
              En producción, estos mensajes se enviarían vía <strong>Meta WhatsApp Cloud API</strong> al número del residente.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
