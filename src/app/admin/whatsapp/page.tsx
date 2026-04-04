'use client';
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface WaStatus {
  status: string;
  enabled: boolean;
  hasCredentials: boolean;
  phone?: { id: string; display: string; name: string; quality: string; platform: string };
  error?: string;
}

export default function WhatsAppAdminPage() {
  const [waStatus, setWaStatus] = useState<WaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then(r => r.json())
      .then(d => { setWaStatus(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-7 h-7 text-[#25D366]" />
            <h1 className="text-2xl font-extrabold text-slate-800">WhatsApp Business</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          ) : !waStatus ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-700 font-semibold">Error al conectar</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Connection status */}
              <div className={`border rounded-2xl p-6 ${waStatus.status === 'connected' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {waStatus.status === 'connected' ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-amber-500" />
                  )}
                  <div>
                    <p className="font-bold text-lg text-slate-800">
                      {waStatus.status === 'connected' ? 'Conectado' : waStatus.status === 'mock' ? 'Modo Demo' : 'Desconectado'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {waStatus.enabled ? 'API habilitada' : 'API deshabilitada'}
                    </p>
                  </div>
                </div>

                {waStatus.phone && (
                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs">Nombre</p>
                        <p className="font-semibold text-slate-800">{waStatus.phone.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Numero</p>
                        <p className="font-semibold text-slate-800">{waStatus.phone.display}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Calidad</p>
                        <p className={`font-semibold ${waStatus.phone.quality === 'GREEN' ? 'text-green-600' : 'text-amber-600'}`}>{waStatus.phone.quality}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Plataforma</p>
                        <p className="font-semibold text-slate-800">{waStatus.phone.platform}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-sm text-slate-500">
                  La configuracion de WhatsApp Business se maneja desde el panel de Meta Developers.
                  Los templates de mensajes, webhooks y numeros se configuran ahi.
                </p>
                <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-blue-500 hover:text-blue-700 font-semibold">
                  Ir a Meta Developers →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
