'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Building2, Plus, Trash2, CheckCircle, User, Phone } from 'lucide-react';

interface ResidentForm {
  id?: string;
  name: string;
  phone: string;
}

export default function MiDeptoPage() {
  const [buildingName, setBuildingName] = useState('');
  const [apt, setApt] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [residents, setResidents] = useState<ResidentForm[]>([]);
  const [contactPref, setContactPref] = useState('whatsapp');
  const [nanaName, setNanaName] = useState('');
  const [nanaPhone, setNanaPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load building name
  useEffect(() => {
    supabase.from('app_settings').select('building_name').eq('id', 1).single().then(({ data }) => {
      if (data) setBuildingName(data.building_name);
    });
  }, []);

  // Load existing data when apt is confirmed
  const handleConfirmApt = async () => {
    if (!apt.trim()) return;
    setConfirmed(true);

    const { data } = await supabase.from('residents').select('*').eq('apt', apt.trim());
    if (data && data.length > 0) {
      const mainResidents = data.filter(r => !r.is_nana);
      const nana = data.find(r => r.is_nana);
      setResidents(mainResidents.map(r => ({ id: r.id, name: r.name, phone: r.phone ?? '' })));
      setContactPref(data[0]?.contact_preference ?? 'whatsapp');
      setNotes(data[0]?.notes ?? '');
      if (nana) {
        setNanaName(nana.name);
        setNanaPhone(nana.phone ?? '');
      }
    } else {
      setResidents([{ name: '', phone: '' }]);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete existing residents for this apt
    await supabase.from('residents').delete().eq('apt', apt.trim());

    // Insert updated residents
    const rows = residents
      .filter(r => r.name.trim())
      .map(r => ({
        apt: apt.trim(),
        name: r.name.trim(),
        phone: r.phone.trim() || null,
        contact_preference: contactPref,
        is_nana: false,
        notes: notes.trim() || null,
      }));

    // Add nana if provided
    if (nanaName.trim()) {
      rows.push({
        apt: apt.trim(),
        name: nanaName.trim(),
        phone: nanaPhone.trim() || null,
        contact_preference: contactPref,
        is_nana: true,
        notes: null,
      });
    }

    if (rows.length > 0) {
      await supabase.from('residents').insert(rows);
    }

    setSaving(false);
    setSaved(true);
  };

  // Success screen
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <Building2 className="w-10 h-10 text-blue-500 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-slate-800">{buildingName || 'Edificio'}</h1>
          <p className="text-sm text-slate-500">Configure su departamento</p>
        </div>

        {/* Step 1: Enter apt */}
        {!confirmed ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Numero de departamento</label>
              <input
                value={apt}
                onChange={e => setApt(e.target.value)}
                placeholder="Ej: 402"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-blue-500"
                inputMode="numeric"
                onKeyDown={e => { if (e.key === 'Enter') handleConfirmApt(); }}
              />
            </div>
            <button
              onClick={handleConfirmApt}
              disabled={!apt.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-slate-400 font-medium">Depto. <span className="font-bold text-slate-800">{apt}</span></p>

            {/* Residents */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">Residentes</label>
              {residents.map((r, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        value={r.name}
                        onChange={e => { const arr = [...residents]; arr[i].name = e.target.value; setResidents(arr); }}
                        placeholder="Nombre"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="w-36 relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        value={r.phone}
                        onChange={e => { const arr = [...residents]; arr[i].phone = e.target.value; setResidents(arr); }}
                        placeholder="56912345678"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        inputMode="tel"
                      />
                    </div>
                  </div>
                  {residents.length > 1 && (
                    <button onClick={() => setResidents(prev => prev.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setResidents(prev => [...prev, { name: '', phone: '' }])}
                className="text-sm text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" /> Agregar residente
              </button>
            </div>

            {/* Contact preference */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">Preferencia de contacto</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
                  { value: 'citofono', label: 'Citofono', emoji: '🔔' },
                  { value: 'llamada', label: 'Llamada', emoji: '📞' },
                  { value: 'ninguno', label: 'No contactar', emoji: '🚫' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setContactPref(opt.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors cursor-pointer ${
                      contactPref === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nana */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">Nana / Empleada</label>
              <div className="flex gap-2">
                <input
                  value={nanaName}
                  onChange={e => setNanaName(e.target.value)}
                  placeholder="Nombre (opcional)"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  value={nanaPhone}
                  onChange={e => setNanaPhone(e.target.value)}
                  placeholder="Telefono"
                  className="w-36 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  inputMode="tel"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Notas</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Informacion adicional (opcional)"
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving || residents.every(r => !r.name.trim())}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
