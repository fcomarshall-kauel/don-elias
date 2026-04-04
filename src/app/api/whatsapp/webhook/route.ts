import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhook, parseWebhookPayload } from '@/lib/whatsapp';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getAptByPhone } from '@/data/residents';

// ─── GET /api/whatsapp/webhook ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const result = verifyWebhook({
    mode: searchParams.get('hub.mode'),
    token: searchParams.get('hub.verify_token'),
    challenge: searchParams.get('hub.challenge'),
  });

  if (result.valid) {
    console.log('[WhatsApp Webhook] Verificacion exitosa');
    return new NextResponse(result.challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[WhatsApp Webhook] Verificacion fallida');
  return NextResponse.json({ error: 'Verificacion fallida' }, { status: 403 });
}

// ─── POST /api/whatsapp/webhook ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = parseWebhookPayload(body);

    if (events.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    for (const event of events) {
      // ─── Status updates (sent → delivered → read) ─────────────────
      if (event.type === 'status' && event.status) {
        const { messageId, status, recipientId } = event.status;
        console.log(`[WhatsApp Status] msgId=${messageId} status=${status} to=${recipientId}`);

        // Update message status in Supabase
        await supabaseAdmin
          .from('whatsapp_messages')
          .update({ status })
          .eq('wa_message_id', messageId);
      }

      // ─── Incoming messages from residents ─────────────────────────
      if (event.type === 'message' && event.message) {
        const { from, text, messageId } = event.message;
        console.log(`[WhatsApp Incoming] from=${from} msgId=${messageId} text="${text.substring(0, 100)}"`);

        // Reverse lookup: phone → apartment
        const apt = getAptByPhone(from) ?? `?${from.slice(-4)}`;

        // Save incoming message to Supabase
        await supabaseAdmin
          .from('whatsapp_messages')
          .insert({
            apt,
            text,
            sent_at: new Date().toISOString(),
            event_type: 'incoming',
            direction: 'incoming',
            phone_number: from,
            wa_message_id: messageId,
            status: 'delivered',
            mock: false,
          });

        console.log(`[WhatsApp Incoming] Saved to DB: apt=${apt}`);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('[WhatsApp Webhook Error]', err);
    return NextResponse.json({ status: 'ok' });
  }
}
