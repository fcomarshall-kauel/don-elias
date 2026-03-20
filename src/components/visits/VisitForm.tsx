'use client';
import { useState } from 'react';
import { VisitType } from '@/types';
import { User, Users, Wrench } from 'lucide-react';

const TYPES: { value: VisitType; label: string; icon: typeof User }[] = [
  { value: 'personal',   label: 'Personal',   icon: User },
  { value: 'empleada',   label: 'Empleada',   icon: Users },
  { value: 'mantencion', label: 'Mantención', icon: Wrench },
];

interface VisitFormProps {
  onSubmit: (data: { visitorName: string; destinationApt: string; type: VisitType; companyOrWorkType?: string }) => void;
}

export function VisitForm({ onSubmit }: VisitFormProps) {
  const [name, setName] = useState('');
  const [apt, setApt] = useState('');
  const [type, setType] = useState<VisitType>('personal');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !apt.trim()) {
      setError('Completa el nombre y el departamento.');
      return;
    }
    onSubmit({ visitorName: name.trim(), destinationApt: apt.trim(), type, companyOrWorkType: type === 'mantencion' ? company.trim() : undefined });
    setName(''); setApt(''); setType('personal'); setCompany(''); setError('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Nombre del visitante</label>
        <input
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold focus:border-[#0056D2] focus:outline-none bg-white"
          placeholder="Ej: María González"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Departamento</label>
        <input
          inputMode="numeric"
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold focus:border-[#0056D2] focus:outline-none bg-white"
          placeholder="Ej: 1102"
          value={apt}
          onChange={e => setApt(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tipo de visita</label>
        <div className="flex gap-2">
          {TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors cursor-pointer ${
                type === value
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

      {type === 'mantencion' && (
        <div>
          <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Empresa / Tipo de trabajo</label>
          <input
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold focus:border-[#0056D2] focus:outline-none bg-white"
            placeholder="Ej: TK Ascensores, Gasfíter"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-red-600 text-base font-semibold">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-[#0056D2] hover:bg-primary-dark active:bg-[#003080] text-white py-4 rounded-xl text-xl font-bold transition-colors cursor-pointer mt-1"
      >
        Registrar Ingreso
      </button>
    </div>
  );
}
