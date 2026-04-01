'use client';
import { useEffect } from 'react';

const DEMO_VISITS = [
  { id: '1', visitorName: 'Carlos Ramírez', destinationApt: '802', type: 'personal', checkedInAt: new Date(Date.now() - 25 * 60000).toISOString(), status: 'active' },
  { id: '2', visitorName: 'Anita Torres', destinationApt: '504', type: 'empleada', checkedInAt: new Date(Date.now() - 90 * 60000).toISOString(), status: 'active' },
  { id: '3', visitorName: 'TK Ascensores', destinationApt: 'Sala Máquinas', type: 'mantencion', companyOrWorkType: 'Mantención ascensor', checkedInAt: new Date(Date.now() - 120 * 60000).toISOString(), status: 'active' },
];

const DEMO_PACKAGES = [
  { id: 'p1', recipientApt: '1102', type: 'food', provider: 'Uber Eats', receivedAt: new Date(Date.now() - 10 * 60000).toISOString(), receivedBy: 'Claudio', status: 'pending' },
  { id: 'p2', recipientApt: '203', type: 'normal', provider: 'Mercado Libre', receivedAt: new Date(Date.now() - 45 * 60000).toISOString(), receivedBy: 'Claudio', status: 'pending', notifiedAt: new Date(Date.now() - 40 * 60000).toISOString() },
  { id: 'p3', recipientApt: '504', type: 'other', receivedAt: new Date(Date.now() - 180 * 60000).toISOString(), receivedBy: 'Pedro Soto', status: 'pending' },
  { id: 'p4', recipientApt: '301', type: 'supermercado', provider: 'Jumbo', receivedAt: new Date(Date.now() - 20 * 60000).toISOString(), receivedBy: 'Claudio', status: 'pending' },
];

const DEMO_NOVEDADES = [
  { id: 'n1', text: 'Depto 1102 dejó sobre en recepción para ser retirado por Carolina Vega, hermana de la propietaria.', category: 'informativo', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), author: 'Pedro Soto', isHandoverEntry: false },
  { id: 'n2', text: 'Se cortó el agua caliente en los pisos 3 al 6. Llamé a gasfíter, llega en la tarde. Avisé al comité.', category: 'urgente', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), author: 'Claudio', isHandoverEntry: false },
  { id: 'n3', text: 'Recordar avisar a depto 301 que su bicicleta está en el espacio equivocado del estacionamiento.', category: 'tarea', createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), author: 'Claudio', isHandoverEntry: false },
];

// Demo WhatsApp messages — muestran el historial de notificaciones enviadas
const DEMO_WHATSAPP = [
  {
    id: 'w1',
    apt: '203',
    text: '📦 Hola, tiene un *paquete* en la recepción de Gran Bretaña. Favor retirarlo cuando pueda.\n\n_Recepción — Gran Bretaña_',
    sentAt: new Date(Date.now() - 40 * 60000).toISOString(),
    packageId: 'p2',
    eventType: 'notify',
  },
  {
    id: 'w2',
    apt: '504',
    text: '📄 Hola, tiene un *documento* en la recepción de Gran Bretaña. Puede retirarlo cuando guste.\n\n_Recepción — Gran Bretaña_',
    sentAt: new Date(Date.now() - 170 * 60000).toISOString(),
    packageId: 'p3',
    eventType: 'notify',
  },
  {
    id: 'w3',
    apt: '802',
    text: '📦 Hola, tiene un *paquete* en la recepción de Gran Bretaña. Favor retirarlo cuando pueda.\n\n_Recepción — Gran Bretaña_',
    sentAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    packageId: 'p_old1',
    eventType: 'notify',
  },
  {
    id: 'w4',
    apt: '802',
    text: '✅ Su paquete fue *retirado exitosamente*. ¡Hasta pronto!\n\n_Recepción — Gran Bretaña_',
    sentAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    packageId: 'p_old1',
    eventType: 'delivered',
  },
];

export function DemoSeeder() {
  useEffect(() => {
    if (!localStorage.getItem('porter_demo_seeded_v3')) {
      localStorage.removeItem('porter_demo_seeded');
      localStorage.removeItem('porter_demo_seeded_v2');
      localStorage.setItem('porter_visits', JSON.stringify(DEMO_VISITS));
      localStorage.setItem('porter_packages', JSON.stringify(DEMO_PACKAGES));
      localStorage.setItem('porter_novedades', JSON.stringify(DEMO_NOVEDADES));
      localStorage.setItem('porter_whatsapp', JSON.stringify(DEMO_WHATSAPP));
      localStorage.setItem('porter_settings', JSON.stringify({ conciergerName: 'Claudio', buildingName: 'Gran Bretaña' }));
      localStorage.setItem('porter_demo_seeded_v3', 'true');
      window.location.reload();
    }
  }, []);

  return null;
}
