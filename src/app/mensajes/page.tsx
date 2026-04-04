'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatView, EmptyChatView } from '@/components/messages/ChatView';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { MessageCircle, Trash2 } from 'lucide-react';

export default function MensajesPage() {
  const { conversationList, getConversation, clearMessages } = useWhatsAppMessages();
  const [selectedApt, setSelectedApt] = useState<string | null>(null);

  const chatMessages = selectedApt ? getConversation(selectedApt) : [];

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex">
        {/* Left: conversation list */}
        <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="px-4 py-3 bg-[#f0f2f5] border-b border-slate-200 flex items-center gap-2 shrink-0">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-lg font-bold text-slate-800">Mensajes</h2>
            <div className="ml-auto flex items-center gap-2">
              {conversationList.length > 0 && (
                <span className="bg-[#25D366] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {conversationList.length}
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
            selectedApt={selectedApt}
            onSelect={setSelectedApt}
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
