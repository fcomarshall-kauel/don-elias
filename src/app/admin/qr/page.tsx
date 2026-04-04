'use client';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/hooks/useSettings';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer } from 'lucide-react';

export default function QRAdminPage() {
  const { settings } = useSettings();

  // Build the URL for the resident self-config page
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/mi-depto`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <QrCode className="w-7 h-7 text-slate-600" />
            <h1 className="text-2xl font-extrabold text-slate-800">QR para Residentes</h1>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center" id="qr-print">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{settings.buildingName}</h2>
            <p className="text-slate-500 mb-6">Escanee para configurar su departamento</p>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200">
                <QRCodeSVG
                  value={url}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-1">O visite:</p>
            <p className="text-sm font-mono text-blue-500 break-all">{url}</p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-4">
            Imprima este QR y coloquelo en el lobby para que los residentes configuren su informacion de contacto.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
