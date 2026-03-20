'use client';
import { useState, useEffect } from 'react';
import { Package } from '@/types';
import { CheckCircle } from 'lucide-react';

interface StoredPackage extends Package {}

function loadPackagesByUnit(): Record<string, StoredPackage[]> {
  try {
    const raw = localStorage.getItem('porter_packages');
    if (!raw) return {};
    const all: StoredPackage[] = JSON.parse(raw);
    return all
      .filter(p => p.status === 'pending')
      .reduce<Record<string, StoredPackage[]>>((acc, pkg) => {
        if (!acc[pkg.recipientApt]) acc[pkg.recipientApt] = [];
        acc[pkg.recipientApt].push(pkg);
        return acc;
      }, {});
  } catch {
    return {};
  }
}

function loadBuildingName(): string {
  try {
    const raw = localStorage.getItem('porter_settings');
    if (!raw) return 'Edificio';
    return JSON.parse(raw).buildingName ?? 'Edificio';
  } catch {
    return 'Edificio';
  }
}

function LobbyTime() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-right">
      <p className="text-5xl font-mono font-bold text-white">{time}</p>
      <p className="text-slate-400 text-lg capitalize mt-1">{date}</p>
    </div>
  );
}

export default function LobbyPage() {
  const [packagesByUnit, setPackagesByUnit] = useState<Record<string, StoredPackage[]>>({});
  const [buildingName, setBuildingName] = useState('Edificio');

  useEffect(() => {
    const load = () => {
      setPackagesByUnit(loadPackagesByUnit());
      setBuildingName(loadBuildingName());
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const units = Object.keys(packagesByUnit).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-white">{buildingName}</h1>
          <p className="text-slate-400 text-lg mt-1">Recepción de Paquetes</p>
        </div>
        <LobbyTime />
      </header>

      {/* Body */}
      <main className="flex-1 p-8">
        {units.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-64 gap-6">
            <CheckCircle className="w-24 h-24 text-green-500" />
            <div className="text-center">
              <p className="text-4xl font-bold text-white">Sin paquetes pendientes</p>
              <p className="text-slate-400 text-xl mt-2">Todos los paquetes han sido retirados</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-xl mb-6">Los siguientes departamentos tienen paquete(s) en recepción:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {units.map(apt => {
                const pkgs = packagesByUnit[apt];
                const hasFood = pkgs.some(p => p.type === 'food');
                return (
                  <div
                    key={apt}
                    className={`rounded-3xl p-6 border-2 flex items-center gap-5 ${
                      hasFood
                        ? 'bg-red-950 border-red-500'
                        : 'bg-slate-800 border-slate-600'
                    }`}
                  >
                    <div>
                      <p className="text-slate-400 text-lg">Depto.</p>
                      <p className={`text-6xl font-black leading-none ${hasFood ? 'text-red-400' : 'text-white'}`}>
                        {apt}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className={`text-xl font-bold ${hasFood ? 'text-red-300' : 'text-slate-300'}`}>
                        {pkgs.length} paquete{pkgs.length !== 1 ? 's' : ''}
                      </p>
                      {hasFood && (
                        <p className="text-red-400 text-sm mt-1 font-semibold">🍕 Incluye comida</p>
                      )}
                      <p className="text-slate-500 text-sm mt-1">en recepción</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-slate-700 flex items-center justify-between">
        <p className="text-slate-600 text-sm">PorterOS · Sistema de Portería</p>
        <p className="text-slate-600 text-sm">Actualizado cada 30 segundos</p>
      </footer>
    </div>
  );
}
