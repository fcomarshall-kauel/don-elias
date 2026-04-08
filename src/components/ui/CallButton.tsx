'use client';
import { Phone } from 'lucide-react';
import { makeCall, canMakeCall } from '@/lib/phone';

interface CallButtonProps {
  phoneNumber?: string | null;
  variant?: 'icon' | 'full' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CallButton({
  phoneNumber, variant = 'icon', size = 'md', className = '',
}: CallButtonProps) {
  if (!canMakeCall(phoneNumber)) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    makeCall(phoneNumber);
  };

  // Icon-only (for compact UI like cards)
  if (variant === 'icon') {
    const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-11 h-11',
    };
    const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
    return (
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors cursor-pointer ${className}`}
        title="Llamar"
      >
        <Phone className={iconSize[size]} />
      </button>
    );
  }

  // Compact (icon + small label)
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer ${className}`}
      >
        <Phone className="w-3 h-3" />
        Llamar
      </button>
    );
  }

  // Full button
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 rounded-xl font-bold text-base transition-colors cursor-pointer ${className}`}
    >
      <Phone className="w-5 h-5" />
      Llamar ahora
    </button>
  );
}
