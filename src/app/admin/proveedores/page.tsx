'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useProviders } from '@/hooks/useProviders';
import { PackageType } from '@/types';
import { Package, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

const TABS: { type: PackageType; label: string; emoji: string }[] = [
  { type: 'normal', label: 'Paquetes', emoji: '📦' },
  { type: 'food', label: 'Comida', emoji: '🍔' },
  { type: 'supermercado', label: 'Super', emoji: '🛒' },
  { type: 'other', label: 'Otros', emoji: '📄' },
];

export default function ProveedoresAdminPage() {
  const { providers, loading, addProvider, updateProvider, deleteProvider } = useProviders();
  const [activeTab, setActiveTab] = useState<PackageType>('normal');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const filtered = providers.filter(p => p.packageType === activeTab);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addProvider({ name: newName.trim(), packageType: activeTab });
    setNewName('');
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
            <Package className="w-7 h-7 text-purple-500" />
            <h1 className="text-2xl font-extrabold text-slate-800">Proveedores</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map(({ type, label, emoji }) => (
              <button
                key={type}
                onClick={() => { setActiveTab(type); setAdding(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === type ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* Provider list */}
          <div className="flex flex-col gap-2">
            {filtered.map(p => (
              <div key={p.id} className={`bg-white border rounded-xl px-4 py-3 flex items-center gap-3 ${p.isActive ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
                <span className="font-semibold text-slate-800 flex-1">{p.name}</span>
                <button
                  onClick={() => updateProvider(p.id, { isActive: !p.isActive })}
                  className={`p-1 ${p.isActive ? 'text-green-500' : 'text-slate-300'}`}
                >
                  {p.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => deleteProvider(p.id)} className="text-slate-300 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {adding ? (
            <div className="mt-3 flex gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del proveedor" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              />
              <button onClick={handleAdd} disabled={!newName.trim()} className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold">Agregar</button>
              <button onClick={() => setAdding(false)} className="text-slate-400 p-2"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-400 hover:border-purple-400 hover:text-purple-500 py-3 rounded-xl transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Agregar proveedor
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
