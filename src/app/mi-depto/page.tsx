'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Building2, Plus, Trash2, CheckCircle, User, Phone } from 'lucide-react';

export default function MiDeptoPage() {
  const [buildingName, setBuildingName] = useState('');
  const [apt, setApt] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [residents, setResidents] = useState<string[]>(['']);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [contactForPackages, setContactForPackages] = useState('citofono');
  const [contactForVisits, setContactForVisits] = useState('citofono');
  const [nanas, setNanas] = useState<string[]>([]);
  const [nanaSchedule, setNanaSchedule] = useState('');
  const [frequentVisitors, setFrequentVisitors] = useState<string[]>([]);
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
      const main = data.filter(r => !r.is_nana && !r.is_frequent_visitor);
      setResidents(main.length > 0 ? main.map(r => r.name) : ['']);
      setWhatsappPhone(main.find(r => r.phone)?.phone ?? '');
      setContactForPackages(data[0]?.contact_for_packages ?? 'citofono');
      setContactForVisits(data[0]?.contact_for_visits ?? 'citofono');
      setNanas(data.filter(r => r.is_nana).map(r => r.name));
      setNanaSchedule(data.find(r => r.is_nana)?.schedule ?? '');
      setFrequentVisitors(data.filter(r => r.is_frequent_visitor).map(r => r.name));
      setNotes(data[0]?.notes ?? '');
    } else {
      setResidents(['']);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('residents').delete().eq('apt', apt.trim());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[] = [];
    const phone = whatsappPhone.trim() || null;

    residents.filter(n => n.trim()).forEach(name => {
      rows.push({
        apt: apt.trim(), name: name.trim(), phone,
        contact_preference: contactForPackages, contact_for_packages: contactForPackages,
        contact_for_visits: contactForVisits, is_nana: false, is_frequent_visitor: false,
        notes: notes.trim() || null,
      });
    });

    nanas.filter(n => n.trim()).forEach(name => {
      rows.push({
        apt: apt.trim(), name: name.trim(), phone: null,
        contact_preference: contactForPackages, contact_for_packages: contactForPackages,
        contact_for_visits: contactForVisits, is_nana: true, is_frequent_visitor: false,
        schedule: nanaSchedule.trim() || null,
      });
    });

    frequentVisitors.filter(n => n.trim()).forEach(name => {
      rows.push({
        apt: apt.trim(), name: name.trim(), phone: null,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
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
    <div className="min-h-screen bg-slate-50 overflow-y-auto" style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-white rounded-3xl shadow-lg p-6">
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

              {/* Residents (names only) */}
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">👤 Residentes</label>
                {residents.map((name, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <div className="flex-1 relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input value={name}
                        onChange={e => { const arr = [...residents]; arr[i] = e.target.value; setResidents(arr); }}
                        placeholder="Nombre completo"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>
                    {residents.length > 1 && (
                      <button onClick={() => setResidents(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setResidents(prev => [...prev, ''])}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Agregar residente
                </button>
              </div>

              {/* Single WhatsApp phone for the apt */}
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">📱 Telefono WhatsApp del departamento</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input value={whatsappPhone} onChange={e => setWhatsappPhone(e.target.value)}
                    placeholder="56912345678"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    inputMode="tel" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Este numero recibira las notificaciones de paquetes</p>
              </div>

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
                <label className="text-sm font-semibold text-slate-600 mb-2 block">🧹 Empleada domestica</label>
                {nanas.length === 0 ? (
                  <button onClick={() => setNanas([''])}
                    className="w-full text-xs text-slate-400 hover:text-purple-500 border border-dashed border-slate-300 hover:border-purple-400 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Agregar empleada
                  </button>
                ) : (
                  <>
                    {nanas.map((name, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={name} onChange={e => { const arr = [...nanas]; arr[i] = e.target.value; setNanas(arr); }}
                          placeholder="Nombre" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                        <button onClick={() => setNanas(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <input value={nanaSchedule} onChange={e => setNanaSchedule(e.target.value)}
                      placeholder="Horario: L-V 9:00-18:00" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </>
                )}
              </div>

              {/* Frequent visitors */}
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">🔄 Visitas frecuentes</label>
                {frequentVisitors.length === 0 ? (
                  <button onClick={() => setFrequentVisitors([''])}
                    className="w-full text-xs text-slate-400 hover:text-green-500 border border-dashed border-slate-300 hover:border-green-400 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Agregar visita frecuente
                  </button>
                ) : (
                  <>
                    {frequentVisitors.map((name, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={name} onChange={e => { const arr = [...frequentVisitors]; arr[i] = e.target.value; setFrequentVisitors(arr); }}
                          placeholder="Nombre del visitante" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                        <button onClick={() => setFrequentVisitors(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setFrequentVisitors(prev => [...prev, ''])}
                      className="text-xs text-green-500 hover:text-green-700 font-medium flex items-center gap-1 mt-1">
                      <Plus className="w-3 h-3" /> Agregar otra
                    </button>
                  </>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">📝 Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Informacion adicional (opcional)" rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={saving || residents.every(n => !n.trim())}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
