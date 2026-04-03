import { NextRequest, NextResponse } from 'next/server';
import { sendTemplateMessage, sendTextMessage } from '@/lib/whatsapp';

// ─── Template config ────────────────────────────────────────────────────────
// Templates creados en Meta Business Suite (WABA 1882208525632408):
//
//   package_notification (id: 909975458527434)
//     Body: "Hola, tiene un {{1}} en la recepcion de {{2}}. Favor retirarlo cuando pueda. Gracias."
//     Footer: "Recepcion - Don Elias"
//     Variables: {{1}} = tipo paquete, {{2}} = nombre edificio
//
//   package_delivered (id: 1539964744138245)
//     Body: "Su paquete fue retirado exitosamente de la recepcion de {{1}}. Hasta pronto!"
//     Footer: "Recepcion - Don Elias"
//     Variables: {{1}} = nombre edificio

const TEMPLATE_MAP: Record<string, { name: string; lang: string }> = {
  package_notification: { name: 'package_notification', lang: 'es' },
  package_delivered:    { name: 'package_delivered',    lang: 'es' },
  hello_world:         { name: 'hello_world',          lang: 'en_US' },
};

// Mapeo de PackageType → texto legible para el template
const PACKAGE_TYPE_LABELS: Record<string, string> = {
  food: 'pedido de comida',
  supermercado: 'pedido de supermercado',
  normal: 'paquete',
  other: 'encomienda',
};

// ─── POST /api/whatsapp/send ────────────────────────────────────────────────

interface SendRequest {
  to: string;              // "56912345678"
  apt: string;             // "15B" — para logging
  templateName?: string;   // override directo del template
  languageCode?: string;   // override del idioma
  components?: Array<{
    type: 'body' | 'header' | 'button';
    parameters: Array<{ type: 'text'; text: string }>;
  }>;
  text?: string;           // Texto libre (solo dentro de ventana 24hrs)
  packageId: string;       // Para trazabilidad
  eventType?: string;      // 'notify' | 'delivered'
  packageType?: string;    // 'food' | 'normal' | 'other' | 'supermercado'
  buildingName?: string;   // Nombre del edificio para variables
}

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json();

    // Validar campos requeridos
    if (!body.to || !body.apt || !body.packageId) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: to, apt, packageId' },
        { status: 400 }
      );
    }

    // Validar formato de telefono chileno
    if (!/^56\d{9}$/.test(body.to)) {
      return NextResponse.json(
        { success: false, error: 'Formato de telefono invalido. Esperado: 56XXXXXXXXX (11 digitos)' },
        { status: 400 }
      );
    }

    let result;

    if (body.text) {
      // Texto libre: solo funciona dentro de ventana de 24hrs (gratis)
      result = await sendTextMessage({ to: body.to, text: body.text });
    } else {
      // Template message: resolver template + construir components con variables
      const templateKey = body.templateName
        ?? (body.eventType === 'notify' ? 'package_notification' : undefined)
        ?? (body.eventType === 'delivered' ? 'package_delivered' : undefined)
        ?? 'hello_world';

      const mapped = TEMPLATE_MAP[templateKey];
      const templateName = mapped?.name ?? templateKey;
      const languageCode = body.languageCode ?? mapped?.lang ?? 'es';

      // Auto-construir components si no se pasan explicitamente
      const components = body.components ?? buildTemplateComponents(templateKey, body);

      result = await sendTemplateMessage({
        to: body.to,
        templateName,
        languageCode,
        components,
      });

      // Si el template custom falla (pendiente o rechazado), fallback a hello_world
      if (!result.success && templateKey !== 'hello_world') {
        console.warn(
          `[WhatsApp] Template "${templateName}" fallo, intentando hello_world como fallback`
        );
        result = await sendTemplateMessage({
          to: body.to,
          templateName: 'hello_world',
          languageCode: 'en_US',
        });
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 }
      );
    }

    console.log(
      `[WhatsApp Send] to=${body.to} apt=${body.apt} pkg=${body.packageId} msgId=${result.messageId} mock=${result.mock ?? false}`
    );

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      mock: result.mock ?? false,
    });
  } catch (err) {
    console.error('[WhatsApp Send Route Error]', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// ─── Auto-build template components ─────────────────────────────────────────
// Construye los parametros de variables para cada template conocido.

function buildTemplateComponents(
  templateKey: string,
  body: SendRequest
): Array<{ type: 'body'; parameters: Array<{ type: 'text'; text: string }> }> | undefined {
  const building = body.buildingName ?? 'el edificio';

  switch (templateKey) {
    case 'package_notification': {
      const typeLabel = PACKAGE_TYPE_LABELS[body.packageType ?? 'normal'] ?? 'paquete';
      return [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: typeLabel },
            { type: 'text', text: building },
          ],
        },
      ];
    }

    case 'package_delivered':
      return [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: building },
          ],
        },
      ];

    default:
      return undefined; // hello_world u otros no necesitan variables
  }
}
