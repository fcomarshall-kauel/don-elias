'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/lib/supabase/client';
import { Building2, Save, CheckCircle } from 'lucide-react';

export default function EdificioAdminPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({
    buildingName: '',
    address: '',
    conserjeriaHours: '08:00-20:00',
    reminderHours: 4,
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load extended settings
    supabase.from('app_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setForm({
          buildingName: data.building_name ?? '',
          address: data.address ?? '',
          conserjeriaHours: data.conserjeria_hours ?? '08:00-20:00',
          reminderHours: data.reminder_hours ?? 4,
          emergencyContact: data.emergency_contact ?? '',
          emergencyPhone: data.emergency_phone ?? '',
        });
      }
    });
  }, []);

  const handleSave = async () => {
    await supabase.from('app_settings').update({
      building_name: form.buildingName,
      address: form.address,
      conserjeria_hours: form.conserjeriaHours,
      reminder_hours: form.reminderHours,
      emergency_contact: form.emergencyContact,
      emergency_phone: form.emergencyPhone,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-7 h-7 text-blue-500" />
            <h1 className="text-2xl font-extrabold text-slate-800">Edificio</h1>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Nombre del edificio</label>
              <input value={form.buildingName} onChange={e => setForm(p => ({ ...p, buildingName: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Dirección</label>
              <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Av. Gran Bretaña 123" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Horario de conserjería</label>
              <input value={form.conserjeriaHours} onChange={e => setForm(p => ({ ...p, conserjeriaHours: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="08:00-20:00" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Recordatorio de paquete (horas)</label>
              <input type="number" value={form.reminderHours} onChange={e => setForm(p => ({ ...p, reminderHours: Number(e.target.value) }))}
                className="w-32 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" min={1} max={48} />
              <p className="text-xs text-slate-400 mt-1">Enviar recordatorio si el paquete no se retira en X horas</p>
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Contacto de emergencia</label>
              <input value={form.emergencyContact} onChange={e => setForm(p => ({ ...p, emergencyContact: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="Nombre del administrador" />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Teléfono de emergencia</label>
              <input value={form.emergencyPhone} onChange={e => setForm(p => ({ ...p, emergencyPhone: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" placeholder="56912345678" />
            </div>

            <button onClick={handleSave}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                saved ? 'bg-green-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}>
              {saved ? <><CheckCircle className="w-4 h-4" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar cambios</>}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
