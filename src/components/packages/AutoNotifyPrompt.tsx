'use client';
import { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { BigButton } from '../ui/BigButton';
import { CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { getResidentsByApt, getPhonesByApt } from '@/data/residents';
import { PackageType } from '@/types';

interface AutoNotifyPromptProps {
  isOpen: boolean;
  apt: string;
  packageType: PackageType;
  onConfirm: () => void;   // Usuario quiere enviar WhatsApp
  onDismiss: () => void;   // Usuario dice "ahora no"
}

const AUTO_CLOSE_SECONDS = 10;

export function AutoNotifyPrompt({ isOpen, apt, packageType, onConfirm, onDismiss }: AutoNotifyPromptProps) {
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const residents = getResidentsByApt(apt);
  const phones = getPhonesByApt(apt);
  const hasPhone = phones.length > 0;

  const typeLabels: Record<string, string> = {
    food: 'Pedido de comida',
    supermercado: 'Pedido de supermercado',
    normal: 'Paquete',
    other: 'Encomienda',
  };

  useEffect(() => {
    if (isOpen) {
      setCountdown(AUTO_CLOSE_SECONDS);
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

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
          {residents.length > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              {residents.slice(0, 2).join(', ')}
              {residents.length > 2 && ` +${residents.length - 2}`}
            </p>
          )}
        </div>

        {/* WhatsApp prompt */}
        {hasPhone ? (
          <div className="w-full flex flex-col gap-3 mt-2">
            <BigButton
              variant="success"
              onClick={onConfirm}
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
        ) : (
          <div className="w-full flex flex-col gap-3 mt-2">
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-2">
              Sin telefono registrado para este depto.
            </p>
            <BigButton variant="primary" onClick={onDismiss} className="w-full">
              Entendido
            </BigButton>
          </div>
        )}
      </div>
    </Modal>
  );
}
