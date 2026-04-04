'use client';
import { MessageCircle, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { WaMessageStatus, WhatsAppMessage } from '@/types';

interface ConversationItem {
  apt: string;
  lastMessage: { text: string; sentAt: string; status?: WaMessageStatus; mock?: boolean; direction?: string };
  count: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  allMessages: WhatsAppMessage[];
  selectedApt: string | null;
  lastSeenMap: Record<string, string>;
  onSelect: (apt: string) => void;
}

function StatusIcon({ status, mock }: { status?: WaMessageStatus; mock?: boolean }) {
  if (mock) return <Clock className="w-3 h-3 text-slate-400" />;
  switch (status) {
    case 'sent':
      return <Check className="w-3 h-3 text-slate-400" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-slate-400" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    case 'failed':
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    case 'sending':
      return <Clock className="w-3 h-3 text-slate-300 animate-pulse" />;
    default:
      return <Check className="w-3 h-3 text-slate-400" />;
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
}

function countUnseenCustom(apt: string, allMessages: WhatsAppMessage[], lastSeenAt?: string): number {
  return allMessages.filter(m => {
    if (m.apt !== apt) return false;
    if (m.direction !== 'incoming') return false;
    // Only custom messages (not quick replies)
    const isQuick = m.text === 'Ya bajo' || m.text === 'Más tarde' || m.text === 'Mas tarde';
    if (isQuick) return false;
    // Not seen yet
    if (lastSeenAt && new Date(m.sentAt) <= new Date(lastSeenAt)) return false;
    return true;
  }).length;
}

export function ConversationList({ conversations, allMessages, selectedApt, lastSeenMap, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 p-6">
        <MessageCircle className="w-12 h-12 text-slate-300" />
        <p className="text-sm font-medium">Sin conversaciones</p>
        <p className="text-xs text-center">Los mensajes enviados desde Paquetes apareceran aqui</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(({ apt, lastMessage, count }) => {
        const isSelected = apt === selectedApt;
        const isIncoming = lastMessage.direction === 'incoming';
        const unseenCount = countUnseenCustom(apt, allMessages, lastSeenMap[apt]);

        return (
          <button
            key={apt}
            onClick={() => onSelect(apt)}
            className={`
              w-full text-left px-4 py-3 border-b border-slate-100 transition-colors
              ${isSelected ? 'bg-[#f0f2f5]' : unseenCount > 0 ? 'bg-green-50/50 hover:bg-green-50' : 'hover:bg-slate-50'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                  unseenCount > 0 ? 'bg-red-500' : 'bg-[#25D366]'
                }`}>
                  {apt}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm ${unseenCount > 0 ? 'font-black text-slate-900' : 'font-semibold text-slate-800'}`}>
                    Depto. {apt}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {!isIncoming && <StatusIcon status={lastMessage.status} mock={lastMessage.mock} />}
                    {isIncoming && <span className="text-xs">💬</span>}
                    <p className={`text-xs truncate max-w-[140px] ${unseenCount > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                      {lastMessage.text.replace(/[*_~`]/g, '').substring(0, 50)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[10px] ${unseenCount > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                  {formatTime(lastMessage.sentAt)}
                </span>
                {unseenCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {unseenCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
