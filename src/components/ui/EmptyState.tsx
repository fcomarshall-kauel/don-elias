import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  submessage?: string;
}

export function EmptyState({ icon, message, submessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <p className="text-xl font-medium text-slate-500">{message}</p>
      {submessage && <p className="text-base mt-1 text-slate-400">{submessage}</p>}
    </div>
  );
}
