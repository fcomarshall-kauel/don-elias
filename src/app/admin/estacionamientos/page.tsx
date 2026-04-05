'use client';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useParkingSpots } from '@/hooks/useParkingSpots';
import { useVisits } from '@/hooks/useVisits';
import { Car, Plus, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function EstacionamientosAdminPage() {
  const { parkingSpots, isOccupied, addSpot, updateSpot, deleteSpot } = useParkingSpots();
  const { activeVisits } = useVisits();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addSpot({ name: newName.trim() });
    setNewName('');
    setAdding(false);
  };

  // Find which visit occupies a spot
  const getOccupant = (spotName: string) => {
    return activeVisits.find(v => v.parkingSpot === spotName);
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Car className="w-7 h-7 text-blue-500" />
            <h1 className="text-2xl font-extrabold text-slate-800">Estacionamientos</h1>
          </div>

          {/* Status overview */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">
                {parkingSpots.filter(s => s.isActive && !isOccupied(s.name)).length} disponibles
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-slate-600">
                {parkingSpots.filter(s => s.isActive && isOccupied(s.name)).length} ocupados
              </span>
            </div>
          </div>

          {/* Spots list */}
          <div className="flex flex-col gap-2">
            {parkingSpots.map(spot => {
              const occupied = isOccupied(spot.name);
              const occupant = occupied ? getOccupant(spot.name) : null;
              return (
                <div
                  key={spot.id}
                  className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${
                    !spot.isActive ? 'opacity-50 border-slate-100' :
                    occupied ? 'border-red-200 bg-red-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    occupied ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {occupied ? '🔴' : '🟢'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{spot.name}</p>
                    {occupied && occupant && (
                      <p className="text-xs text-red-600 mt-0.5">
                        🚗 {occupant.vehiclePlate} · {occupant.visitorName} · Depto. {occupant.destinationApt}
                      </p>
                    )}
                    {!occupied && spot.isActive && (
                      <p className="text-xs text-green-600 mt-0.5">Disponible</p>
                    )}
                  </div>
                  <button
                    onClick={() => updateSpot(spot.id, { isActive: !spot.isActive })}
                    className={`p-1 ${spot.isActive ? 'text-green-500' : 'text-slate-300'}`}
                  >
                    {spot.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => deleteSpot(spot.id)} className="text-slate-300 hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {adding ? (
            <div className="mt-3 flex gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre del estacionamiento (ej: Visita 6)"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                autoFocus
              />
              <button onClick={handleAdd} disabled={!newName.trim()} className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold">
                Agregar
              </button>
              <button onClick={() => setAdding(false)} className="text-slate-400 p-2"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 py-3 rounded-xl transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Agregar estacionamiento
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
