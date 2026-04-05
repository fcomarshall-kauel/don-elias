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
  vehiclePlate?: string;
  parkingSpot?: string;
}

export interface ParkingSpot {
  id: string;
  name: string;
  spotType: 'visita' | 'residente' | 'otro';
  isActive: boolean;
  sortOrder: number;
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

// WhatsApp Business Cloud API — Meta Graph API v22.0
export type WaEventType = 'notify' | 'delivered' | 'incoming';
export type WaMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  apt: string;              // Número de depto
  text: string;             // Cuerpo del mensaje (para UI local)
  sentAt: string;           // ISO 8601
  packageId: string;        // Trazabilidad al paquete origen
  eventType: WaEventType;
  phoneNumber?: string;     // Formato internacional sin +: "56912345678"
  waMessageId?: string;     // ID de mensaje de Meta para tracking de estado
  status?: WaMessageStatus; // Estado de entrega
  mock?: boolean;           // true si se envió sin API real (modo desarrollo)
  direction?: 'outgoing' | 'incoming'; // outgoing = conserje→residente, incoming = residente→conserje
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  mock?: boolean;
  error?: string;
}
