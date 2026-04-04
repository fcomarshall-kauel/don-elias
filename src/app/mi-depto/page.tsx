'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Building2, Plus, Trash2, CheckCircle, User, Phone } from 'lucide-react';

interface PersonForm { id?: string; name: string; phone: string; }

export default function MiDeptoPage() {
  const [buildingName, setBuildingName] = useState('');
  const [apt, setApt] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [residents, setResidents] = useState<PersonForm[]>([]);
  const [contactForPackages, setContactForPackages] = useState('whatsapp');
  const [contactForVisits, setContactForVisits] = useState('citofono');
  const [nanas, setNanas] = useState<PersonForm[]>([]);
  const [nanaSchedule, setNanaSchedule] = useState('');
  const [frequentVisitors, setFrequentVisitors] = useState<PersonForm[]>([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('building_name').eq('id', 1).single().then(({ data }) => {
      if (data) setBuildingName(data.building_name);
    });
  }, []);

  const handleConfirmApt = async () => {
    if (!apt.trim()) return;
    setConfirmed(true);

    const { data } = await supabase.from('residents').select('*').eq('apt', apt.trim());
    if (data && data.length > 0) {
      setResidents(data.filter(r => !r.is_nana && !r.is_frequent_visitor).map(r => ({ id: r.id, name: r.name, phone: r.phone ?? '' })));
      setNanas(data.filter(r => r.is_nana).map(r => ({ id: r.id, name: r.name, phone: r.phone ?? '' })));
      setFrequentVisitors(data.filter(r => r.is_frequent_visitor).map(r => ({ id: r.id, name: r.name, phone: r.phone ?? '' })));
      setContactForPackages(data[0]?.contact_for_packages ?? 'whatsapp');
      setContactForVisits(data[0]?.contact_for_visits ?? 'citofono');
      setNanaSchedule(data.find(r => r.is_nana)?.schedule ?? '');
      setNotes(data[0]?.notes ?? '');
    } else {
      setResidents([{ name: '', phone: '' }]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('residents').delete().eq('apt', apt.trim());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];

    residents.filter(r => r.name.trim()).forEach(r => {
      rows.push({
        apt: apt.trim(), name: r.name.trim(), phone: r.phone.trim() || null,
        contact_preference: contactForPackages, contact_for_packages: contactForPackages,
        contact_for_visits: contactForVisits, is_nana: false, is_frequent_visitor: false,
        notes: notes.trim() || null,
      });
    });

    nanas.filter(r => r.name.trim()).forEach(r => {
      rows.push({
        apt: apt.trim(), name: r.name.trim(), phone: r.phone.trim() || null,
        contact_preference: contactForPackages, contact_for_packages: contactForPackages,
        contact_for_visits: contactForVisits, is_nana: true, is_frequent_visitor: false,
        schedule: nanaSchedule.trim() || null,
      });
    });

    frequentVisitors.filter(r => r.name.trim()).forEach(r => {
      rows.push({
        apt: apt.trim(), name: r.name.trim(), phone: r.phone.trim() || null,
        contact_preference: contactForPackages, contact_for_packages: contactForPackages,
        contact_for_visits: contactForVisits, is_nana: false, is_frequent_visitor: true,
      });
    });

    if (rows.length > 0) await supabase.from('residents').insert(rows);
    setSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Datos guardados</h2>
          <p className="text-slate-500">Depto. {apt} actualizado correctamente.</p>
          <p className="text-sm text-slate-400 mt-4">{buildingName}</p>
        </div>
      </div>
    );
  }

  const contactOptions = [
    { value: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
    { value: 'citofono', label: 'Citofono', emoji: '🔔' },
    { value: 'llamada', label: 'Llamada', emoji: '📞' },
    { value: 'ninguno', label: 'No contactar', emoji: '🚫' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="bg-white rounded-3xl shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <Building2 className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-slate-800">{buildingName || 'Edificio'}</h1>
          <p className="text-sm text-slate-500">Configure su departamento</p>
        </div>

        {!confirmed ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Numero de departamento</label>
              <input value={apt} onChange={e => setApt(e.target.value)} placeholder="Ej: 402"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-blue-500"
                inputMode="numeric" onKeyDown={e => { if (e.key === 'Enter') handleConfirmApt(); }} />
            </div>
            <button onClick={handleConfirmApt} disabled={!apt.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors">
              Continuar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-slate-400 font-medium">Depto. <span className="font-bold text-slate-800">{apt}</span></p>

            {/* Residents */}
            <Section title="👤 Residentes" items={residents} setItems={setResidents} placeholder="Nombre completo" />

            {/* Contact preferences */}
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm font-bold text-slate-700">Preferencia de contacto</p>
              <div>
                <p className="text-xs text-slate-500 mb-1">Para paquetes / encomiendas</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {contactOptions.map(opt => (
                    <button key={opt.value} onClick={() => setContactForPackages(opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors cursor-pointer ${
                        contactForPackages === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                      }`}>{opt.emoji} {opt.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Para visitas</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {contactOptions.map(opt => (
                    <button key={opt.value} onClick={() => setContactForVisits(opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors cursor-pointer ${
                        contactForVisits === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                      }`}>{opt.emoji} {opt.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nana */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-2">🧹 Empleada domestica</p>
              <Section title="" items={nanas} setItems={setNanas} placeholder="Nombre de la empleada" compact />
              {nanas.length > 0 && (
                <input value={nanaSchedule} onChange={e => setNanaSchedule(e.target.value)}
                  placeholder="Horario: L-V 9:00-18:00" className="w-full mt-2 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              )}
            </div>

            {/* Frequent visitors */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-2">🔄 Visitas frecuentes</p>
              <Section title="" items={frequentVisitors} setItems={setFrequentVisitors} placeholder="Nombre del visitante" compact />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">📝 Notas</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Informacion adicional (opcional)" rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>

            <button onClick={handleSave} disabled={saving || residents.every(r => !r.name.trim())}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title, items, setItems, placeholder, compact,
}: {
  title: string;
  items: { name: string; phone: string }[];
  setItems: (fn: (prev: typeof items) => typeof items) => void;
  placeholder: string;
  compact?: boolean;
}) {
  return (
    <div>
      {title && <label className="text-sm font-semibold text-slate-600 mb-2 block">{title}</label>}
      {items.map((r, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={r.name} onChange={e => { setItems(prev => { const arr = [...prev]; arr[i] = { ...arr[i], name: e.target.value }; return arr; }); }}
                placeholder={placeholder} className={`w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 ${compact ? 'text-xs' : ''}`} />
            </div>
            <div className="w-36 relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={r.phone} onChange={e => { setItems(prev => { const arr = [...prev]; arr[i] = { ...arr[i], phone: e.target.value }; return arr; }); }}
                placeholder="56912345678" className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" inputMode="tel" />
            </div>
          </div>
          {items.length > 1 && (
            <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button onClick={() => setItems(prev => [...prev, { name: '', phone: '' }])}
        className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-1">
        <Plus className="w-3 h-3" /> Agregar
      </button>
    </div>
  );
}
