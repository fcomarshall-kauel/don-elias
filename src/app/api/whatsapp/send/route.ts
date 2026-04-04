import { NextRequest, NextResponse } from 'next/server';
import { sendTemplateMessage, sendTextMessage } from '@/lib/whatsapp';

// ─── Template config ────────────────────────────────────────────────────────
// 6 templates creados en Meta WABA 1882208525632408:
//
// Notificaciones (4 tipos, con Quick Reply "Ya bajo" / "Más tarde"):
//   notify_food     → comida
//   notify_package  → paquete normal
//   notify_grocery  → supermercado
//   notify_other    → encomienda/otro
//
// Variables compartidas: {{1}}=proveedor, {{2}}=conserje, {{3}}=obs, {{4}}=edificio
//
// Entrega + Recordatorio:
//   pkg_delivered   → {{1}}=quien retiró, {{2}}=edificio
//   pkg_reminder    → {{1}}=edificio

const TEMPLATE_MAP: Record<string, { name: string; lang: string }> = {
  // Notificaciones por tipo de paquete
  food:         { name: 'notify_food',    lang: 'es' },
  normal:       { name: 'notify_package', lang: 'es' },
  supermercado: { name: 'notify_grocery', lang: 'es' },
  other:        { name: 'notify_other',   lang: 'es' },
  // Entrega y recordatorio
  delivered:    { name: 'pkg_delivered',  lang: 'es' },
  reminder:     { name: 'pkg_reminder',  lang: 'es' },
  // Fallback
  hello_world:  { name: 'hello_world',   lang: 'en_US' },
};

// ─── POST /api/whatsapp/send ────────────────────────────────────────────────

interface SendRequest {
  to: string;              // "56912345678"
  apt: string;             // "15B"
  templateName?: string;   // override directo
  languageCode?: string;
  components?: Array<{
    type: 'body' | 'header' | 'button';
    parameters: Array<{ type: 'text'; text: string }>;
  }>;
  text?: string;           // Texto libre (solo dentro de ventana 24hrs)
  packageId: string;
  eventType?: string;      // 'notify' | 'delivered' | 'reminder'
  packageType?: string;    // 'food' | 'normal' | 'other' | 'supermercado'
  buildingName?: string;
  provider?: string;       // "Mercado Libre", "Uber Eats", etc.
  note?: string;           // "caja frágil", "3 bolsas"
  concierge?: string;      // "Claudio"
  deliveredTo?: string;    // "Juan Pérez" (para entrega)
}

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json();

    if (!body.to || !body.apt || !body.packageId) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos: to, apt, packageId' },
        { status: 400 }
      );
    }

    if (!/^56\d{9}$/.test(body.to)) {
      return NextResponse.json(
        { success: false, error: 'Formato de teléfono inválido. Esperado: 56XXXXXXXXX (11 dígitos)' },
        { status: 400 }
      );
    }

    let result;

    if (body.text) {
      result = await sendTextMessage({ to: body.to, text: body.text });
    } else {
      // Resolver template key
      let templateKey: string;
      if (body.templateName) {
        templateKey = body.templateName;
      } else if (body.eventType === 'notify' && body.packageType) {
        templateKey = body.packageType; // food, normal, supermercado, other
      } else if (body.eventType === 'delivered') {
        templateKey = 'delivered';
      } else if (body.eventType === 'reminder') {
        templateKey = 'reminder';
      } else {
        templateKey = 'hello_world';
      }

      const mapped = TEMPLATE_MAP[templateKey];
      const templateName = mapped?.name ?? templateKey;
      const languageCode = body.languageCode ?? mapped?.lang ?? 'es';
      const components = body.components ?? buildTemplateComponents(templateKey, body);

      result = await sendTemplateMessage({
        to: body.to,
        templateName,
        languageCode,
        components,
      });

      // Fallback a hello_world si el template custom falla
      if (!result.success && templateKey !== 'hello_world') {
        console.warn(`[WhatsApp] Template "${templateName}" falló, fallback a hello_world`);
        result = await sendTemplateMessage({
          to: body.to,
          templateName: 'hello_world',
          languageCode: 'en_US',
        });
      }
    }

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
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
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

// ─── Build template components (variables) ──────────────────────────────────

function buildTemplateComponents(
  templateKey: string,
  body: SendRequest
): Array<{ type: 'body'; parameters: Array<{ type: 'text'; text: string }> }> | undefined {
  const building = body.buildingName ?? 'el edificio';
  const concierge = body.concierge ?? 'el conserje';

  // Notificaciones: {{1}}=proveedor, {{2}}=conserje, {{3}}=obs, {{4}}=edificio
  if (['food', 'normal', 'supermercado', 'other'].includes(templateKey)) {
    const providerText = body.provider && body.provider !== 'other' && body.provider !== 'otro'
      ? `De: ${body.provider}. `
      : 'Puede retirarlo en horario de conserjería. ';

    const noteText = body.note
      ? `Obs: ${body.note}.`
      : ' ';

    return [{
      type: 'body',
      parameters: [
        { type: 'text', text: providerText },
        { type: 'text', text: concierge },
        { type: 'text', text: noteText },
        { type: 'text', text: building },
      ],
    }];
  }

  // Entrega: {{1}}=quien retiró, {{2}}=edificio
  if (templateKey === 'delivered') {
    return [{
      type: 'body',
      parameters: [
        { type: 'text', text: body.deliveredTo ?? 'el residente' },
        { type: 'text', text: building },
      ],
    }];
  }

  // Recordatorio: {{1}}=edificio
  if (templateKey === 'reminder') {
    return [{
      type: 'body',
      parameters: [
        { type: 'text', text: building },
      ],
    }];
  }

  return undefined;
}
