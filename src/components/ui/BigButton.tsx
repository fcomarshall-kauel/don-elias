'use client';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'ghost';
type Size = 'default' | 'large';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#1e3a5f] text-white hover:bg-[#2d5a8e] active:bg-[#162d4a]',
  secondary: 'bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] hover:bg-slate-50 active:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
};

export function BigButton({ variant = 'primary', size = 'default', className = '', children, ...props }: BigButtonProps) {
  const sizeClass = size === 'large' ? 'min-h-20 text-xl px-6' : 'min-h-16 text-lg px-5';
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClass}
        rounded-2xl font-semibold
        flex items-center justify-center gap-3
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer select-none w-full
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
