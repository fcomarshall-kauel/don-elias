'use client';
import { useState } from 'react';
import { NovedadCategory } from '@/types';
import { AlertTriangle, Info, CheckSquare } from 'lucide-react';

const CATEGORIES: { value: NovedadCategory; label: string; icon: typeof Info; activeStyle: string; iconColor: string }[] = [
  { value: 'urgente',     label: 'Urgente',    icon: AlertTriangle, activeStyle: 'border-red-500 bg-red-50 text-red-700',    iconColor: 'text-red-600' },
  { value: 'informativo', label: 'Info',       icon: Info,          activeStyle: 'border-[#0056D2] bg-primary-light text-[#0056D2]', iconColor: 'text-[#0056D2]' },
  { value: 'tarea',       label: 'Tarea',      icon: CheckSquare,   activeStyle: 'border-amber-500 bg-amber-50 text-amber-700', iconColor: 'text-amber-600' },
];

interface NovedadFormProps {
  authorName: string;
  onSubmit: (data: { text: string; category: NovedadCategory; author: string }) => void;
}

export function NovedadForm({ authorName, onSubmit }: NovedadFormProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<NovedadCategory>('informativo');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) { setError('Escribe el contenido de la novedad.'); return; }
    onSubmit({ text: text.trim(), category, author: authorName });
    setText(''); setCategory('informativo'); setError('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Categoría</label>
        <div className="flex gap-2">
          {CATEGORIES.map(({ value, label, icon: Icon, activeStyle, iconColor }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-colors cursor-pointer ${
                category === value ? activeStyle : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${category === value ? iconColor : 'text-slate-400'}`} />
              <span className="text-sm font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Descripción</label>
        <textarea
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base font-medium focus:border-[#0056D2] focus:outline-none resize-none bg-white"
          rows={5}
          placeholder='Ej: "Depto 1102 dejó sobre para retirar..."'
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600 text-base font-semibold">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-[#0056D2] hover:bg-primary-dark active:bg-[#003080] text-white py-4 rounded-xl text-xl font-bold transition-colors cursor-pointer"
      >
        Agregar Novedad
      </button>
    </div>
  );
}
