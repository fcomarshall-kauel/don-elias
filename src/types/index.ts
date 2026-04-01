export type VisitType = 'personal' | 'empleada' | 'mantencion';

export interface Visit {
  id: string;
  visitorName: string;
  destinationApt: string;
  type: VisitType;
  companyOrWorkType?: string;
  checkedInAt: string;
  checkedOutAt?: string;
  status: 'active' | 'checked-out';
}

export type PackageType = 'food' | 'normal' | 'other' | 'supermercado';
export type PackageStatus = 'pending' | 'delivered';

export interface Package {
  id: string;
  recipientApt: string;
  type: PackageType;
  provider?: string;
  note?: string;
  receivedAt: string;
  receivedBy: string;
  deliveredAt?: string;
  deliveredTo?: string;
  status: PackageStatus;
  notifiedAt?: string;
}

export type NovedadCategory = 'urgente' | 'informativo' | 'tarea';

export interface Novedad {
  id: string;
  text: string;
  category: NovedadCategory;
  createdAt: string;
  author: string;
  isHandoverEntry: boolean;
}

export interface AppSettings {
  conciergerName: string;
  buildingName: string;
}

// WhatsApp mock — arquitectura lista para Meta Cloud API o Twilio
export type WaEventType = 'notify' | 'delivered';

export interface WhatsAppMessage {
  id: string;
  apt: string;          // Número de depto (actúa como contacto/número)
  text: string;         // Cuerpo del mensaje enviado
  sentAt: string;       // ISO 8601 — timestamp de envío
  packageId: string;    // Trazabilidad: referencia al paquete origen
  eventType: WaEventType;
  // PRODUCCIÓN: añadir aquí → phoneNumber: string (sin +56, sin espacios)
  // El envío real usaría: POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
}
