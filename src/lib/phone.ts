// ─── Phone helpers ──────────────────────────────────────────────────────
// Native tel: link support for tablets with SIM (no Twilio/Telnyx needed).
// Opens the device's native dialer with the number pre-filled.
// On Android PWAs (standalone), the OS returns to the app after the call ends.

export function makeCall(phoneNumber: string): void {
  if (!canMakeCall(phoneNumber)) return;
  // Normalize: ensure international format with leading +
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  const normalized = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  window.location.href = `tel:${normalized}`;
}

export function canMakeCall(phoneNumber?: string | null): phoneNumber is string {
  if (!phoneNumber) return false;
  const cleaned = phoneNumber.replace(/[\s-+]/g, '');
  // Must be at least 8 digits (Chilean mobile is 9: 569XXXXXXXX)
  return /^\d{8,15}$/.test(cleaned);
}

export function formatPhoneForDisplay(phoneNumber?: string | null): string {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/[\s-+]/g, '');
  // Chilean format: +56 9 XXXX XXXX
  if (cleaned.startsWith('569') && cleaned.length === 11) {
    return `+56 9 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return `+${cleaned}`;
}
