'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatView, EmptyChatView } from '@/components/messages/ChatView';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useSeenMessages } from '@/hooks/useSeenMessages';
import { MessageCircle, Trash2 } from 'lucide-react';
import { WhatsAppMessage } from '@/types';

export default function MensajesPage() {
  const { messages, conversationList, getConversation, clearMessages } = useWhatsAppMessages();
  const { seenMap, markSeen } = useSeenMessages();
  const searchParams = useSearchParams();
  const [selectedApt, setSelectedApt] = useState<string | null>(null);

  // Support ?apt=402 query param
  useEffect(() => {
    const apt = searchParams.get('apt');
    if (apt) setSelectedApt(apt);
  }, [searchParams]);

  // Mark conversation as seen when selected
  useEffect(() => {
    if (selectedApt) markSeen(selectedApt);
  }, [selectedApt, markSeen]);

  // Count total unseen custom messages across all apts
  const totalUnseen = conversationList.reduce((sum, { apt }) => {
    const unseenForApt = messages.filter((m: WhatsAppMessage) => {
      if (m.apt !== apt || m.direction !== 'incoming') return false;
      const isQuick = m.text === 'Ya bajo' || m.text === 'Más tarde' || m.text === 'Mas tarde';
      if (isQuick) return false;
      const lastSeen = seenMap[apt];
      if (lastSeen && new Date(m.sentAt) <= new Date(lastSeen)) return false;
      return true;
    }).length;
    return sum + unseenForApt;
  }, 0);

  const handleSelect = (apt: string) => {
    setSelectedApt(apt);
    markSeen(apt);
  };

  const chatMessages = selectedApt ? getConversation(selectedApt) : [];

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex">
        {/* Left: conversation list */}
        <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="px-4 py-3 bg-[#f0f2f5] border-b border-slate-200 flex items-center gap-2 shrink-0">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-lg font-bold text-slate-800">Conversaciones</h2>
            <div className="ml-auto flex items-center gap-2">
              {totalUnseen > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalUnseen}
                </span>
              )}
              {conversationList.length > 0 && (
                <button
                  onClick={() => { clearMessages(); setSelectedApt(null); }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Borrar historial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <ConversationList
            conversations={conversationList}
            allMessages={messages}
            selectedApt={selectedApt}
            lastSeenMap={seenMap}
            onSelect={handleSelect}
          />
        </div>

        {/* Right: chat view */}
        {selectedApt ? (
          <ChatView apt={selectedApt} messages={chatMessages} />
        ) : (
          <EmptyChatView />
        )}
      </div>
    </AppShell>
  );
}
