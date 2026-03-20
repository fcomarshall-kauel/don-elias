'use client';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { BigButton } from './BigButton';
import { CheckCircle, Loader2, MessageCircle } from 'lucide-react';

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apt: string;
  messageText?: string;  // Texto del mensaje que se "enviará" vía WhatsApp
  onConfirm?: () => void;
  onMessageSent?: () => void; // Callback para registrar el mensaje en el historial
}

export function NotifyModal({ isOpen, onClose, apt, messageText, onConfirm, onMessageSent }: NotifyModalProps) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    if (isOpen) {
      setPhase('loading');
      const t = setTimeout(() => setPhase('done'), 2200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (phase === 'done') {
      onConfirm?.();
      onMessageSent?.();  // Guarda el mensaje en el historial de WhatsApp
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col items-center text-center py-4 gap-4">
        {phase === 'loading' ? (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <div>
              <p className="text-2xl font-bold text-slate-800">Notificando...</p>
              <p className="text-slate-500 mt-1">Enviando aviso al depto. {apt}</p>
              <div className="flex flex-col gap-2 mt-4 text-left bg-slate-50 rounded-xl p-3 w-full">
                <p className="text-sm text-slate-400 font-medium">Enviando vía:</p>
                <p className="text-sm text-slate-600">📞 Citófono...</p>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <p className="text-sm text-slate-600">WhatsApp...</p>
                </div>
                {messageText && (
                  <div className="bg-[#DCF8C6] rounded-lg p-2 mt-1 text-left">
                    <p className="text-xs text-slate-600 line-clamp-3">{messageText}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-[#25D366]" />
              <MessageCircle className="w-7 h-7 text-[#25D366] absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">¡Notificación enviada!</p>
              <p className="text-slate-500 mt-1">Depto. {apt} fue notificado</p>
              <p className="text-slate-400 text-sm mt-1">vía citófono y WhatsApp ✓✓</p>
            </div>
            <BigButton variant="success" onClick={handleClose} className="mt-2">
              Listo
            </BigButton>
          </>
        )}
      </div>
    </Modal>
  );
}
