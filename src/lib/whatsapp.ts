// ─── WhatsApp Business Cloud API — Cliente server-side ──────────────────────
// Solo se importa desde API routes (nunca desde componentes client).
// Usa Meta Graph API v21.0 con template messages.
//
// Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api

const GRAPH_API_VERSION = 'v22.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface TemplateComponent {
  type: 'body' | 'header' | 'button';
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time';
    text?: string;
  }>;
}

interface SendTemplateParams {
  to: string;                      // "56912345678" — sin +
  templateName: string;            // nombre del template aprobado por Meta
  languageCode?: string;           // default: "es"
  components?: TemplateComponent[];
}

interface SendTextParams {
  to: string;
  text: string;
}

export interface MetaSendResult {
  success: boolean;
  messageId?: string;
  mock?: boolean;
  error?: string;
}

interface MetaWebhookStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipientId: string;
}

interface MetaWebhookIncoming {
  from: string;
  text: string;
  messageId: string;
  timestamp: string;
}

export interface WebhookEvent {
  type: 'status' | 'message';
  status?: MetaWebhookStatus;
  message?: MetaWebhookIncoming;
}

// ─── Helpers internos ───────────────────────────────────────────────────────

function getConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    apiToken: process.env.WHATSAPP_API_TOKEN ?? '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  };
}

function isConfigured(): boolean {
  const { phoneNumberId, apiToken } = getConfig();
  return !!(phoneNumberId && apiToken);
}

// ─── Enviar template message (para iniciar conversación) ────────────────────

export async function sendTemplateMessage(params: SendTemplateParams): Promise<MetaSendResult> {
  if (!isConfigured()) {
    // Modo mock: devuelve éxito simulado para desarrollo sin credenciales
    console.log('[WhatsApp Mock] Template message:', params);
    return {
      success: true,
      messageId: `mock-${crypto.randomUUID()}`,
      mock: true,
    };
  }

  const { phoneNumberId, apiToken } = getConfig();

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: params.to,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode ?? 'es' },
      ...(params.components?.length ? { components: params.components } : {}),
    },
  };

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message ?? `HTTP ${res.status}`;
      console.error('[WhatsApp API Error]', errorMsg);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id ?? '';
    return { success: true, messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[WhatsApp Network Error]', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ─── Enviar texto libre (dentro de ventana de 24hrs) ────────────────────────

export async function sendTextMessage(params: SendTextParams): Promise<MetaSendResult> {
  if (!isConfigured()) {
    console.log('[WhatsApp Mock] Text message:', params);
    return {
      success: true,
      messageId: `mock-${crypto.randomUUID()}`,
      mock: true,
    };
  }

  const { phoneNumberId, apiToken } = getConfig();

  const body = {
    messaging_product: 'whatsapp',
    to: params.to,
    type: 'text',
    text: { body: params.text },
  };

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message ?? `HTTP ${res.status}`;
      console.error('[WhatsApp API Error]', errorMsg);
      return { success: false, error: errorMsg };
    }

    const messageId = data?.messages?.[0]?.id ?? '';
    return { success: true, messageId };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[WhatsApp Network Error]', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ─── Verificación de webhook (GET) ──────────────────────────────────────────

export function verifyWebhook(params: {
  mode: string | null;
  token: string | null;
  challenge: string | null;
}): { valid: boolean; challenge: string } {
  const { verifyToken } = getConfig();

  if (
    params.mode === 'subscribe' &&
    params.token === verifyToken &&
    params.challenge
  ) {
    return { valid: true, challenge: params.challenge };
  }

  return { valid: false, challenge: '' };
}

// ─── Parser de webhook payload (POST) ───────────────────────────────────────

export function parseWebhookPayload(body: Record<string, unknown>): WebhookEvent[] {
  const events: WebhookEvent[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (body as any)?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;
        if (!value) continue;

        // Status updates (sent, delivered, read)
        const statuses = value?.statuses ?? [];
        for (const s of statuses) {
          events.push({
            type: 'status',
            status: {
              messageId: s.id,
              status: s.status,
              timestamp: s.timestamp,
              recipientId: s.recipient_id,
            },
          });
        }

        // Incoming messages
        const messages = value?.messages ?? [];
        for (const m of messages) {
          if (m.type === 'text') {
            events.push({
              type: 'message',
              message: {
                from: m.from,
                text: m.text?.body ?? '',
                messageId: m.id,
                timestamp: m.timestamp,
              },
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook Parse Error]', err);
  }

  return events;
}
