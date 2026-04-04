'use client';
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { BigButton } from '../ui/BigButton';
import { CheckCircle, MessageCircle, Phone, Clock } from 'lucide-react';
import { PackageType } from '@/types';
import { ContactMethod } from '@/hooks/useResidents';

interface AutoNotifyPromptProps {
  isOpen: boolean;
  apt: string;
  packageType: PackageType;
  contactMethod: ContactMethod;  // whatsapp | citofono | llamada | ninguno
  hasPhone: boolean;
  residentNames: string[];
  onConfirmWhatsApp: () => void;
  onDismiss: () => void;
}

const AUTO_CLOSE_SECONDS = 10;

const typeLabels: Record<string, string> = {
  food: 'Pedido de comida',
  supermercado: 'Pedido de supermercado',
  normal: 'Paquete',
  other: 'Encomienda',
};

export function AutoNotifyPrompt({
  isOpen, apt, packageType, contactMethod, hasPhone, residentNames,
  onConfirmWhatsApp, onDismiss,
}: AutoNotifyPromptProps) {
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (isOpen) {
      setCountdown(AUTO_CLOSE_SECONDS);
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => onDismissRef.current(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine what to show based on contact method
  const isWhatsApp = contactMethod === 'whatsapp';
  const isCallOrIntercom = contactMethod === 'citofono' || contactMethod === 'llamada';
  const isNone = contactMethod === 'ninguno';

  return (
    <Modal isOpen={isOpen} onClose={onDismiss}>
      <div className="flex flex-col items-center text-center py-4 gap-4">
        {/* Success icon */}
        <div className="relative">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        {/* Info */}
        <div>
          <p className="text-2xl font-bold text-slate-800">Paquete registrado</p>
          <p className="text-lg text-slate-600 mt-1">
            {typeLabels[packageType] ?? 'Paquete'} para depto. <strong>{apt}</strong>
          </p>
          {residentNames.length > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              {residentNames.slice(0, 2).join(', ')}
              {residentNames.length > 2 && ` +${residentNames.length - 2}`}
            </p>
          )}
        </div>

        {/* Action based on contact method */}
        {isWhatsApp && hasPhone ? (
          <div className="w-full flex flex-col gap-3 mt-2">
            <BigButton
              variant="success"
              onClick={onConfirmWhatsApp}
              className="flex items-center justify-center gap-2 w-full"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar WhatsApp
            </BigButton>
            <button
              onClick={onDismiss}
              className="text-slate-400 text-sm hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Ahora no ({countdown}s)
            </button>
          </div>
        ) : isWhatsApp && !hasPhone ? (
          <div className="w-full flex flex-col gap-3 mt-2">
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-2">
              Preferencia WhatsApp pero sin telefono registrado.
            </p>
            <BigButton variant="primary" onClick={onDismiss} className="w-full">
              Entendido
            </BigButton>
          </div>
        ) : isCallOrIntercom ? (
          <div className="w-full flex flex-col gap-3 mt-2">
            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-blue-800">
                  {contactMethod === 'citofono' ? 'Avisar por citofono' : 'Avisar por llamada'}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Este depto. prefiere ser contactado por {contactMethod === 'citofono' ? 'citofono' : 'telefono'}
                </p>
              </div>
            </div>
            <BigButton variant="primary" onClick={onDismiss} className="w-full">
              Entendido
            </BigButton>
          </div>
        ) : isNone ? (
          <div className="w-full flex flex-col gap-3 mt-2">
            <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-2">
              Este depto. prefiere no ser contactado.
            </p>
            <BigButton variant="secondary" onClick={onDismiss} className="w-full">
              Entendido
            </BigButton>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
