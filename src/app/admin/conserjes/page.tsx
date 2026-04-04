'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useConcierges } from '@/hooks/useConcierges';
import { HardHat, Plus, Trash2, X, Phone, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ConserjesAdminPage() {
  const { concierges, loading, addConcierge, updateConcierge, deleteConcierge } = useConcierges();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addConcierge({ name: newName.trim(), phone: newPhone.trim() || undefined });
    setNewName('');
    setNewPhone('');
    setAdding(false);
  };

  if (loading) {
    return <AppShell><div className="flex-1 flex items-center justify-center text-slate-400">Cargando...</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <HardHat className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-800">Conserjes</h1>
          </div>

          <div className="flex flex-col gap-3">
            {concierges.map(c => (
              <div key={c.id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${c.isActive ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg">
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{c.name}</p>
                  {c.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => updateConcierge(c.id, { isActive: !c.isActive })}
                  className={`p-1 transition-colors ${c.isActive ? 'text-green-500' : 'text-slate-300'}`}
                  title={c.isActive ? 'Desactivar' : 'Activar'}
                >
                  {c.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button onClick={() => deleteConcierge(c.id)} className="text-slate-300 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {adding ? (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-green-800 text-sm">Nuevo conserje</p>
                <button onClick={() => setAdding(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-2">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Teléfono (opcional)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                <button onClick={handleAdd} disabled={!newName.trim()} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold">Agregar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-400 hover:border-amber-400 hover:text-amber-500 py-3 rounded-xl transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Agregar conserje
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
