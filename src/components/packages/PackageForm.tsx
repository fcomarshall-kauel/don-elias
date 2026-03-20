'use client';
import { useState } from 'react';
import { PackageType } from '@/types';
import { UtensilsCrossed, Package, FileText, AlertTriangle } from 'lucide-react';

const TYPES: { value: PackageType; label: string; icon: typeof Package }[] = [
  { value: 'food',     label: 'Comida',   icon: UtensilsCrossed },
  { value: 'normal',   label: 'Paquete',  icon: Package },
  { value: 'document', label: 'Documento',icon: FileText },
];

interface PackageFormProps {
  onSubmit: (data: { recipientApt: string; type: PackageType }) => void;
}

export function PackageForm({ onSubmit }: PackageFormProps) {
  const [apt, setApt] = useState('');
  const [type, setType] = useState<PackageType>('normal');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!apt.trim()) { setError('Ingresa el departamento.'); return; }
    onSubmit({ recipientApt: apt.trim(), type });
    setApt(''); setType('normal'); setError('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Departamento</label>
        <input
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold focus:border-[#0056D2] focus:outline-none bg-white"
          placeholder="Ej: 504"
          value={apt}
          onChange={e => setApt(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tipo</label>
        <div className="flex gap-2">
          {TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors cursor-pointer ${
                type === value && value === 'food'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : type === value
                  ? 'border-[#0056D2] bg-primary-light text-[#0056D2]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {type === 'food' && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-amber-800">Notificar de inmediato — el alimento se deteriora.</p>
        </div>
      )}

      {error && <p className="text-red-600 text-base font-semibold">{error}</p>}

      <button
        onClick={handleSubmit}
        className={`w-full py-4 rounded-xl text-xl font-bold transition-colors cursor-pointer mt-1 text-white ${
          type === 'food'
            ? 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'
            : 'bg-[#0056D2] hover:bg-primary-dark active:bg-[#003080]'
        }`}
      >
        Registrar Paquete
      </button>
    </div>
  );
}
