import React from 'react';

type BadgeVariant = 'urgente' | 'informativo' | 'tarea' | 'food' | 'normal' | 'other' | 'supermercado' | 'active' | 'done';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const styles: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  urgente:     { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Urgente' },
  informativo: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Informativo' },
  tarea:       { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Tarea pendiente' },
  food:        { bg: 'bg-red-100',    text: 'text-red-700',    label: '🍕 Comida' },
  normal:      { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Normal' },
  other:       { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Otros' },
  supermercado:{ bg: 'bg-green-100',  text: 'text-green-700',  label: '🛒 Supermercado' },
  active:      { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Activo' },
  done:        { bg: 'bg-slate-100',  text: 'text-slate-500',  label: 'Entregado' },
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const s = styles[variant];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}>
      {label ?? s.label}
    </span>
  );
}
