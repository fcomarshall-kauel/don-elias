'use client';
import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useResidents, Resident, ContactMethod } from '@/hooks/useResidents';
import { Search, Plus, Trash2, Save, User, Users, Phone, X, Clock } from 'lucide-react';

const CONTACT_OPTIONS: { value: ContactMethod; label: string; emoji: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
  { value: 'citofono', label: 'Citofono', emoji: '🔔' },
  { value: 'llamada', label: 'Llamada', emoji: '📞' },
  { value: 'ninguno', label: 'No contactar', emoji: '🚫' },
];

function ContactPicker({ label, value, onChange }: { label: string; value: ContactMethod; onChange: (v: ContactMethod) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <div className="flex gap-1">
        {CONTACT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
              value === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonCard({
  resident,
  onEdit,
  onDelete,
  badge,
}: {
  resident: Resident;
  onEdit: () => void;
  onDelete: () => void;
  badge?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-slate-400" />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800 text-sm">{resident.name}</p>
            {badge && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">{badge}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {resident.phone && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Phone className="w-2.5 h-2.5" /> {resident.phone}
              </span>
            )}
            {resident.schedule && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> {resident.schedule}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="text-slate-400 hover:text-blue-500 p-1 text-xs">Editar</button>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-500 p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ResidentesAdminPage() {
  const { residents, loading, getByApt, getNanasByApt, getFrequentVisitorsByApt, addResident, updateResident, deleteResident } = useResidents();
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resident>>({});
  const [addingType, setAddingType] = useState<'resident' | 'nana' | 'visitor' | null>(null);
  const [newForm, setNewForm] = useState({ name: '', phone: '', schedule: '' });

  const grouped = useMemo(() => {
    const map: Record<string, Resident[]> = {};
    for (const r of residents) {
      if (!map[r.apt]) map[r.apt] = [];
      map[r.apt].push(r);
    }
    return map;
  }, [residents]);

  const filteredApts = useMemo(() => {
    const apts = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));
    if (!search) return apts;
    const q = search.toLowerCase();
    return apts.filter(apt =>
      apt.includes(q) || grouped[apt].some(r => r.name.toLowerCase().includes(q))
    );
  }, [grouped, search]);

  const aptResidents = selectedApt ? getByApt(selectedApt) : [];
  const aptNanas = selectedApt ? getNanasByApt(selectedApt) : [];
  const aptVisitors = selectedApt ? getFrequentVisitorsByApt(selectedApt) : [];

  // Get contact prefs from first resident of the apt
  const firstResident = aptResidents[0];
  const contactForPackages = firstResident?.contactForPackages ?? 'whatsapp';
  const contactForVisits = firstResident?.contactForVisits ?? 'citofono';

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await updateResident(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleAdd = async () => {
    if (!newForm.name.trim() || !selectedApt) return;
    await addResident({
      name: newForm.name.trim(),
      apt: selectedApt,
      phone: newForm.phone.trim() || undefined,
      contactPreference: 'whatsapp',
      contactForPackages,
      contactForVisits,
      isNana: addingType === 'nana',
      isFrequentVisitor: addingType === 'visitor',
      schedule: newForm.schedule.trim() || undefined,
    });
    setNewForm({ name: '', phone: '', schedule: '' });
    setAddingType(null);
  };

  const handleContactChange = async (field: 'contactForPackages' | 'contactForVisits', value: ContactMethod) => {
    if (!selectedApt) return;
    const allInApt = residents.filter(r => r.apt === selectedApt);
    for (const r of allInApt) {
      await updateResident(r.id, { [field]: value });
    }
  };

  if (loading) {
    return <AppShell><div className="flex-1 flex items-center justify-center text-slate-400">Cargando...</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-hidden flex">
        {/* Left: apt list */}
        <div className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar depto o nombre..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredApts.map(apt => {
              const all = grouped[apt];
              const mainCount = all.filter(r => !r.isNana && !r.isFrequentVisitor).length;
              const hasNana = all.some(r => r.isNana);
              return (
                <button key={apt} onClick={() => { setSelectedApt(apt); setEditingId(null); setAddingType(null); }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                    apt === selectedApt ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'
                  }`}>
                  <span className="font-bold text-slate-800">Depto. {apt}</span>
                  <span className="text-xs text-slate-400 ml-2">{mainCount}p{hasNana ? ' +nana' : ''}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedApt ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-semibold">Selecciona un departamento</p>
              </div>
            </div>
          ) : (
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Depto. {selectedApt}</h2>

              {/* Contact preferences */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 flex flex-col gap-3">
                <p className="text-sm font-bold text-slate-700">Preferencias de contacto</p>
                <ContactPicker label="Para paquetes / encomiendas" value={contactForPackages}
                  onChange={v => handleContactChange('contactForPackages', v)} />
                <ContactPicker label="Para visitas" value={contactForVisits}
                  onChange={v => handleContactChange('contactForVisits', v)} />
              </div>

              {/* Residents */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                  👤 Residentes <span className="text-slate-400 font-normal">({aptResidents.length})</span>
                </p>
                <div className="flex flex-col gap-2">
                  {aptResidents.map(r => editingId === r.id ? (
                    <div key={r.id} className="bg-white border border-blue-200 rounded-xl p-3 flex flex-col gap-2">
                      <input value={editForm.name ?? r.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Nombre" />
                      <input value={editForm.phone ?? r.phone ?? ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="56912345678" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <Save className="w-3 h-3" /> Guardar
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm({}); }} className="text-slate-400 text-sm px-3">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <PersonCard key={r.id} resident={r} onEdit={() => { setEditingId(r.id); setEditForm({}); }} onDelete={() => deleteResident(r.id)} />
                  ))}
                </div>
                {addingType !== 'resident' ? (
                  <button onClick={() => { setAddingType('resident'); setNewForm({ name: '', phone: '', schedule: '' }); }}
                    className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-blue-500 py-2 cursor-pointer">
                    <Plus className="w-3 h-3" /> Agregar residente
                  </button>
                ) : (
                  <AddForm onAdd={handleAdd} onCancel={() => setAddingType(null)} form={newForm} setForm={setNewForm} />
                )}
              </div>

              {/* Nanas */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                  🧹 Empleada doméstica <span className="text-slate-400 font-normal">({aptNanas.length})</span>
                </p>
                <div className="flex flex-col gap-2">
                  {aptNanas.map(r => editingId === r.id ? (
                    <div key={r.id} className="bg-white border border-blue-200 rounded-xl p-3 flex flex-col gap-2">
                      <input value={editForm.name ?? r.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Nombre" />
                      <input value={editForm.phone ?? r.phone ?? ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="56912345678" />
                      <input value={editForm.schedule ?? r.schedule ?? ''} onChange={e => setEditForm(p => ({ ...p, schedule: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="L-V 9:00-18:00" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <Save className="w-3 h-3" /> Guardar
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm({}); }} className="text-slate-400 text-sm px-3">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <PersonCard key={r.id} resident={r} badge="Nana" onEdit={() => { setEditingId(r.id); setEditForm({}); }} onDelete={() => deleteResident(r.id)} />
                  ))}
                </div>
                {addingType !== 'nana' ? (
                  <button onClick={() => { setAddingType('nana'); setNewForm({ name: '', phone: '', schedule: '' }); }}
                    className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-purple-500 py-2 cursor-pointer">
                    <Plus className="w-3 h-3" /> Agregar empleada
                  </button>
                ) : (
                  <AddForm onAdd={handleAdd} onCancel={() => setAddingType(null)} form={newForm} setForm={setNewForm} showSchedule />
                )}
              </div>

              {/* Frequent visitors */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                  🔄 Visitas frecuentes <span className="text-slate-400 font-normal">({aptVisitors.length})</span>
                </p>
                <div className="flex flex-col gap-2">
                  {aptVisitors.map(r => editingId === r.id ? (
                    <div key={r.id} className="bg-white border border-blue-200 rounded-xl p-3 flex flex-col gap-2">
                      <input value={editForm.name ?? r.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Nombre" />
                      <input value={editForm.phone ?? r.phone ?? ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="56912345678 (opcional)" />
                      <div className="flex gap-2">
                        <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                          <Save className="w-3 h-3" /> Guardar
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm({}); }} className="text-slate-400 text-sm px-3">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <PersonCard key={r.id} resident={r} badge="Frecuente" onEdit={() => { setEditingId(r.id); setEditForm({}); }} onDelete={() => deleteResident(r.id)} />
                  ))}
                </div>
                {addingType !== 'visitor' ? (
                  <button onClick={() => { setAddingType('visitor'); setNewForm({ name: '', phone: '', schedule: '' }); }}
                    className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-green-500 py-2 cursor-pointer">
                    <Plus className="w-3 h-3" /> Agregar visita frecuente
                  </button>
                ) : (
                  <AddForm onAdd={handleAdd} onCancel={() => setAddingType(null)} form={newForm} setForm={setNewForm} />
                )}
              </div>

              {/* Notes */}
              <div>
                <p className="text-sm font-bold text-slate-600 mb-2">📝 Notas del departamento</p>
                <textarea
                  value={firstResident?.notes ?? ''}
                  onChange={e => { if (firstResident) updateResident(firstResident.id, { notes: e.target.value }); }}
                  placeholder="Ej: Timbre no funciona, llamar al celular"
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function AddForm({
  onAdd, onCancel, form, setForm, showSchedule,
}: {
  onAdd: () => void;
  onCancel: () => void;
  form: { name: string; phone: string; schedule: string };
  setForm: (f: (p: typeof form) => typeof form) => void;
  showSchedule?: boolean;
}) {
  return (
    <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-green-800 text-xs">Agregar</p>
        <button onClick={onCancel} className="text-slate-400"><X className="w-3 h-3" /></button>
      </div>
      <div className="flex flex-col gap-2">
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Nombre" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="Telefono (opcional)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        {showSchedule && (
          <input value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))}
            placeholder="Horario: L-V 9:00-18:00" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        )}
        <button onClick={onAdd} disabled={!form.name.trim()}
          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold">
          Agregar
        </button>
      </div>
    </div>
  );
}
