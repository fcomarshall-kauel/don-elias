'use client';
import { NumpadModal as BaseNumpadModal } from '@/components/ui/NumpadModal';
import { PackageType } from '@/types';
import { UtensilsCrossed, Package, ShoppingCart, MoreHorizontal } from 'lucide-react';

const TYPE_CONFIG: Record<PackageType, { label: string; icon: typeof Package; color: string }> = {
  normal:       { label: 'Paquete',      icon: Package,         color: 'text-[#0056D2]' },
  supermercado: { label: 'Supermercado', icon: ShoppingCart,    color: 'text-green-600' },
  food:         { label: 'Comida',       icon: UtensilsCrossed, color: 'text-orange-600' },
  other:        { label: 'Otros',        icon: MoreHorizontal,  color: 'text-slate-500' },
};

interface PackageNumpadModalProps {
  isOpen: boolean;
  type: PackageType;
  onConfirm: (apt: string) => void;
  onClose: () => void;
}

export function NumpadModal({ isOpen, type, onConfirm, onClose }: PackageNumpadModalProps) {
  const config = TYPE_CONFIG[type];
  return (
    <BaseNumpadModal
      isOpen={isOpen}
      label={config.label}
      icon={config.icon}
      iconColor={config.color}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
