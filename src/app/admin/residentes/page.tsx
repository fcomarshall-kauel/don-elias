'use client';
import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useResidents, Resident } from '@/hooks/useResidents';
import { Search, Plus, Trash2, Save, User, Users, Phone, X } from 'lucide-react';

export default function ResidentesAdminPage() {
  const { residents, loading, addResident, updateResident, deleteResident } = useResidents();
  const [search, setSearch] = useState('');
  const [selectedApt, setSelectedApt] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resident>>({});
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', phone: '', apt: '', tower: '' });

  // Group by apt
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

  const selectedResidents = selectedApt ? (grouped[selectedApt] ?? []) : [];

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await updateResident(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleAdd = async () => {
    if (!newForm.name.trim() || !newForm.apt.trim()) return;
    await addResident({
      name: newForm.name.trim(),
      apt: newForm.apt.trim(),
      tower: newForm.tower.trim() || undefined,
      phone: newForm.phone.trim() || undefined,
      contactPreference: 'whatsapp',
      isNana: false,
      isFrequentVisitor: false,
    });
    setNewForm({ name: '', phone: '', apt: selectedApt ?? '', tower: '' });
    setAdding(false);
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
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar depto o nombre..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredApts.map(apt => {
              const count = grouped[apt].length;
              const isSelected = apt === selectedApt;
              return (
                <button
                  key={apt}
                  onClick={() => { setSelectedApt(apt); setEditingId(null); setAdding(false); }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-slate-800">Depto. {apt}</span>
                  <span className="text-xs text-slate-400 ml-2">{count} persona{count !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: resident details */}
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

              {/* Resident list */}
              <div className="flex flex-col gap-3">
                {selectedResidents.map(r => {
                  const isEditing = editingId === r.id;
                  return (
                    <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4">
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <input
                            value={editForm.name ?? r.name}
                            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Nombre"
                          />
                          <input
                            value={editForm.phone ?? r.phone ?? ''}
                            onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Teléfono (56912345678)"
                          />
                          <select
                            value={editForm.contactPreference ?? r.contactPreference}
                            onChange={e => setEditForm(p => ({ ...p, contactPreference: e.target.value as Resident['contactPreference'] }))}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                          >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="citofono">Citófono</option>
                            <option value="llamada">Llamada</option>
                            <option value="ninguno">No contactar</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={handleSaveEdit} className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                              <Save className="w-3 h-3" /> Guardar
                            </button>
                            <button onClick={() => { setEditingId(null); setEditForm({}); }} className="text-slate-400 text-sm px-3">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="font-semibold text-slate-800">{r.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {r.phone && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {r.phone}
                                  </span>
                                )}
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{r.contactPreference}</span>
                                {r.isNana && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Nana</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingId(r.id); setEditForm({}); }} className="text-slate-400 hover:text-blue-500 p-1 text-xs">Editar</button>
                            <button onClick={() => deleteResident(r.id)} className="text-slate-400 hover:text-red-500 p-1">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add resident */}
              {adding ? (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-green-800 text-sm">Agregar residente</p>
                    <button onClick={() => setAdding(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      value={newForm.name}
                      onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                      placeholder="Nombre completo"
                    />
                    <input
                      value={newForm.phone}
                      onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                      placeholder="Teléfono (56912345678)"
                    />
                    <button onClick={handleAdd} disabled={!newForm.name.trim()} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold">
                      Agregar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setAdding(true); setNewForm(p => ({ ...p, apt: selectedApt })); }}
                  className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-400 hover:border-green-400 hover:text-green-500 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Agregar residente
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
