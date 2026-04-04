'use client';
import { MessageCircle, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { WaMessageStatus } from '@/types';

interface ConversationItem {
  apt: string;
  lastMessage: { text: string; sentAt: string; status?: WaMessageStatus; mock?: boolean };
  count: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedApt: string | null;
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

export function ConversationList({ conversations, selectedApt, onSelect }: ConversationListProps) {
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
        return (
          <button
            key={apt}
            onClick={() => onSelect(apt)}
            className={`
              w-full text-left px-4 py-3 border-b border-slate-100 transition-colors
              ${isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-slate-50'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {apt}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">Depto. {apt}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StatusIcon status={lastMessage.status} mock={lastMessage.mock} />
                    <p className="text-xs text-slate-500 truncate max-w-[140px]">
                      {lastMessage.text.replace(/[*_~`]/g, '').substring(0, 50)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-slate-400">{formatTime(lastMessage.sentAt)}</span>
                {count > 1 && (
                  <span className="bg-[#25D366] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
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
