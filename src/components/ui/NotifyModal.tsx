'use client';
import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { BigButton } from './BigButton';
import { CheckCircle, Loader2, MessageCircle, XCircle, RefreshCw, WifiOff, Clock } from 'lucide-react';
import { WhatsAppSendResult } from '@/types';

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apt: string;
  messageText?: string;
  onConfirm?: () => void;
  onSend: () => Promise<WhatsAppSendResult>;
}

export function NotifyModal({ isOpen, onClose, apt, messageText, onConfirm, onSend }: NotifyModalProps) {
  const [phase, setPhase] = useState<'sending' | 'success' | 'queued' | 'error'>('sending');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMock, setIsMock] = useState(false);
  const hasSentRef = useRef(false);
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;

  const doSend = async () => {
    setPhase('sending');
    setErrorMsg('');
    try {
      const result = await onSendRef.current();
      if (result.success) {
        // Check if it was queued (offline) vs actually sent
        const isQueued = result.messageId?.startsWith('offline-') || result.messageId?.startsWith('queued-');
        if (isQueued) {
          setPhase('queued');
        } else {
          setPhase('success');
          setIsMock(result.mock ?? false);
        }
      } else {
        setPhase('error');
        setErrorMsg(result.error ?? 'Error al enviar');
      }
    } catch {
      setPhase('error');
      setErrorMsg('Error de conexion');
    }
  };

  useEffect(() => {
    if (isOpen && !hasSentRef.current) {
      hasSentRef.current = true;
      doSend();
    }
    if (!isOpen) {
      hasSentRef.current = false;
    }
  }, [isOpen]);

  const handleClose = () => {
    if (phase === 'success' || phase === 'queued') {
      onConfirm?.();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col items-center text-center py-4 gap-4">
        {phase === 'sending' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <div>
              <p className="text-2xl font-bold text-slate-800">Notificando...</p>
              <p className="text-slate-500 mt-1">Enviando aviso al depto. {apt}</p>
              <div className="flex flex-col gap-2 mt-4 text-left bg-slate-50 rounded-xl p-3 w-full">
                <p className="text-sm text-slate-400 font-medium">Enviando via:</p>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <p className="text-sm text-slate-600">WhatsApp Business API...</p>
                </div>
                {messageText && (
                  <div className="bg-[#DCF8C6] rounded-lg p-2 mt-1 text-left">
                    <p className="text-xs text-slate-600 line-clamp-3">{messageText}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {phase === 'success' && (
          <>
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-[#25D366]" />
              <MessageCircle className="w-7 h-7 text-[#25D366] absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">Notificacion enviada!</p>
              <p className="text-slate-500 mt-1">Depto. {apt} fue notificado</p>
              <p className="text-slate-400 text-sm mt-1">
                via WhatsApp {isMock ? '(modo demo)' : '✓✓'}
              </p>
            </div>
            <BigButton variant="success" onClick={handleClose} className="mt-2">
              Listo
            </BigButton>
          </>
        )}

        {phase === 'queued' && (
          <>
            <div className="relative">
              <WifiOff className="w-16 h-16 text-amber-500" />
              <Clock className="w-7 h-7 text-amber-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">Mensaje en cola</p>
              <p className="text-slate-500 mt-1">Depto. {apt}</p>
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mt-3">
                No hay conexion a internet. El mensaje se enviara automaticamente cuando se restablezca la conexion.
              </p>
            </div>
            <BigButton variant="primary" onClick={handleClose} className="mt-2">
              Entendido
            </BigButton>
          </>
        )}

        {phase === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">Error al enviar</p>
              <p className="text-slate-500 mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-3 mt-2">
              <BigButton variant="primary" onClick={doSend} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </BigButton>
              <BigButton variant="secondary" onClick={handleClose}>
                Cerrar
              </BigButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
