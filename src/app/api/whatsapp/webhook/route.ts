import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook, parseWebhookPayload } from '@/lib/whatsapp';

// ─── GET /api/whatsapp/webhook ──────────────────────────────────────────────
// Verificacion del webhook por Meta. Se llama una sola vez al configurar.
// Meta envia: ?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=YYY
// Debemos responder con hub.challenge si el token es correcto.

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const result = verifyWebhook({
    mode: searchParams.get('hub.mode'),
    token: searchParams.get('hub.verify_token'),
    challenge: searchParams.get('hub.challenge'),
  });

  if (result.valid) {
    console.log('[WhatsApp Webhook] Verificacion exitosa');
    // Meta espera el challenge como texto plano, no JSON
    return new NextResponse(result.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[WhatsApp Webhook] Verificacion fallida');
  return NextResponse.json({ error: 'Verificacion fallida' }, { status: 403 });
}

// ─── POST /api/whatsapp/webhook ─────────────────────────────────────────────
// Recibe notificaciones de Meta:
// - Status updates: sent, delivered, read, failed
// - Mensajes entrantes de residentes
//
// IMPORTANTE: Meta requiere respuesta 200 rapida. Si tarda > 20s, Meta
// reintenta y eventualmente desactiva el webhook.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = parseWebhookPayload(body);

    if (events.length === 0) {
      // Puede ser un ping de verificacion o formato no reconocido
      return NextResponse.json({ status: 'ok' });
    }

    for (const event of events) {
      if (event.type === 'status' && event.status) {
        const { messageId, status, recipientId } = event.status;
        console.log(
          `[WhatsApp Status] msgId=${messageId} status=${status} to=${recipientId}`
        );

        // TODO: Cuando haya DB, actualizar estado:
        // await db.whatsappMessages.updateMany({
        //   where: { waMessageId: messageId },
        //   data: { status, statusUpdatedAt: new Date() }
        // });

        // TODO: Si status === 'failed', alertar en UI del conserje
      }

      if (event.type === 'message' && event.message) {
        const { from, text, messageId } = event.message;
        console.log(
          `[WhatsApp Incoming] from=${from} msgId=${messageId} text="${text.substring(0, 100)}"`
        );

        // TODO: Procesar con OpenClaw/agente:
        // await processIncomingMessage(event.message)
        //
        // Posibles respuestas automaticas:
        // - "ya bajo" → marcar paquete como "residente en camino"
        // - "gracias" → no action
        // - "quien?" → responder con nombre del conserje
        // - Otro → encolar para el conserje
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[WhatsApp Webhook Error]', err);
    // Aun asi responder 200 para que Meta no desactive el webhook
    return NextResponse.json({ status: 'ok' });
  }
}
