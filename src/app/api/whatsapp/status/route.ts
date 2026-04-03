import { NextResponse } from 'next/server';

// ─── GET /api/whatsapp/status ───────────────────────────────────────────────
// Health check: verifica que las credenciales de WhatsApp esten configuradas
// y que la API de Meta responda. Util para el dashboard del conserje.

export async function GET() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
  const apiToken = process.env.WHATSAPP_API_TOKEN ?? '';
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN ?? '';
  const isEnabled = process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'true';

  const hasCredentials = !!(phoneNumberId && apiToken);

  // Si no hay credenciales, retornar estado mock
  if (!hasCredentials) {
    return NextResponse.json({
      status: 'mock',
      enabled: isEnabled,
      hasCredentials: false,
      hasVerifyToken: !!verifyToken,
      phone: null,
    });
  }

  // Verificar conexion con Meta
  try {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,platform_type`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
        // No cachear — queremos estado real
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return NextResponse.json({
        status: 'error',
        enabled: isEnabled,
        hasCredentials: true,
        error: data?.error?.message ?? `HTTP ${res.status}`,
      });
    }

    const data = await res.json();

    return NextResponse.json({
      status: 'connected',
      enabled: isEnabled,
      hasCredentials: true,
      hasVerifyToken: !!verifyToken,
      phone: {
        id: phoneNumberId,
        display: data.display_phone_number,
        name: data.verified_name,
        quality: data.quality_rating,
        platform: data.platform_type,
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      enabled: isEnabled,
      hasCredentials: true,
      error: err instanceof Error ? err.message : 'Network error',
    });
  }
}
