'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Package, WhatsAppMessage } from '@/types';
import {
  CheckCircle, Check, CheckCheck, Clock, AlertCircle, MessageCircle,
  RefreshCw, X,
} from 'lucide-react';

const typeEmoji: Record<string, string> = {
  food: '🍔', supermercado: '🛒', normal: '📦', other: '📄',
};
const typeLabel: Record<string, string> = {
  food: 'Comida', supermercado: 'Super', normal: 'Paquete', other: 'Otros',
};

// ─── Badge resolution ───────────────────────────────────────────────────────

type BadgeInfo = {
  type: 'status';
  label: string;
  color: string;
  bgColor: string;
  icon: 'clock' | 'check' | 'check-check' | 'check-check-blue' | 'error' | 'none';
} | {
  type: 'quick-reply';
  text: string;
  positive: boolean;
} | {
  type: 'custom-msg';
  text: string;
  apt: string;
  seen: boolean;
};

function resolveBadge(pkg: Package, messages: WhatsAppMessage[], lastSeenAt?: string | null): BadgeInfo {
  const notifyMsg = messages.find(m => m.packageId === pkg.id && m.eventType === 'notify' && m.direction !== 'incoming');

  if (notifyMsg) {
    const incoming = messages.find(m =>
      m.apt === pkg.recipientApt &&
      m.direction === 'incoming' &&
      new Date(m.sentAt) > new Date(notifyMsg.sentAt)
    );
    if (incoming) {
      const isQuick = incoming.text === 'Ya bajo' || incoming.text === 'Más tarde' || incoming.text === 'Mas tarde';
      if (isQuick) {
        return { type: 'quick-reply', text: incoming.text, positive: incoming.text === 'Ya bajo' };
      }
      const seen = lastSeenAt ? new Date(incoming.sentAt) <= new Date(lastSeenAt) : false;
      return { type: 'custom-msg', text: incoming.text, apt: pkg.recipientApt, seen };
    }
  }

  if (!notifyMsg || !pkg.notifiedAt) {
    return { type: 'status', label: 'Sin notificar', color: 'text-slate-400', bgColor: 'bg-slate-100', icon: 'none' };
  }

  switch (notifyMsg.status) {
    case 'sending': return { type: 'status', label: 'Enviando...', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: 'clock' };
    case 'sent': return { type: 'status', label: 'Enviado', color: 'text-slate-500', bgColor: 'bg-slate-100', icon: 'check' };
    case 'delivered': return { type: 'status', label: 'Avisado', color: 'text-green-700', bgColor: 'bg-green-100', icon: 'check-check' };
    case 'read': return { type: 'status', label: 'Leído', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: 'check-check-blue' };
    case 'failed': return { type: 'status', label: 'Error', color: 'text-red-700', bgColor: 'bg-red-100', icon: 'error' };
    default: return { type: 'status', label: 'Avisado', color: 'text-green-700', bgColor: 'bg-green-100', icon: 'check' };
  }
}

function BadgeIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'clock': return <Clock className="w-3 h-3 animate-pulse" />;
    case 'check': return <Check className="w-3 h-3" />;
    case 'check-check': return <CheckCheck className="w-3 h-3" />;
    case 'check-check-blue': return <CheckCheck className="w-3 h-3" />;
    case 'error': return <AlertCircle className="w-3 h-3" />;
    default: return null;
  }
}

// ─── Badge pill (shown on card) ─────────────────────────────────────────────

function BadgePill({ badge }: { badge: BadgeInfo }) {
  if (badge.type === 'quick-reply') {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
        badge.positive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {badge.positive ? '🟢' : '🟡'} {badge.text}
      </span>
    );
  }
  if (badge.type === 'custom-msg') {
    if (badge.seen) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          💬 Respondió
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
        🔴 Mensaje nuevo
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bgColor} ${badge.color}`}>
      <BadgeIcon icon={badge.icon} /> {badge.label}
    </span>
  );
}

// ─── Detail popover (floating) ──────────────────────────────────────────────

function DetailPopover({
  apt,
  packages,
  messages,
  lastSeenAt,
  onClose,
}: {
  apt: string;
  packages: Package[];
  messages: WhatsAppMessage[];
  lastSeenAt?: string | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onMouseDown={onClose}>
      <div
        ref={ref}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 max-h-[70vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">Depto. {apt}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Packages */}
        <div className="divide-y divide-slate-100">
          {packages.map(pkg => {
            const badge = resolveBadge(pkg, messages, lastSeenAt);
            const time = new Date(pkg.receivedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={pkg.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeEmoji[pkg.type] ?? '📦'}</span>
                    <span className="text-sm font-bold text-slate-800">{typeLabel[pkg.type] ?? 'Paquete'}</span>
                  </div>
                  <span className="text-xs text-slate-400">{time}</span>
                </div>

                {pkg.provider && (
                  <p className="text-xs text-slate-500 mb-1">De: {pkg.provider}</p>
                )}
                {pkg.note && (
                  <p className="text-xs text-slate-400 italic mb-1">Obs: {pkg.note}</p>
                )}
                <p className="text-xs text-slate-400 mb-2">Recibido por: {pkg.receivedBy}</p>

                <BadgePill badge={badge} />

                {/* Show custom message inline */}
                {badge.type === 'custom-msg' && (
                  <div className="mt-2 bg-slate-50 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">&ldquo;{badge.text}&rdquo;</p>
                    </div>
                    <Link
                      href={`/mensajes?from=paquetes&apt=${apt}`}
                      className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-[#25D366] hover:text-[#1da851]"
                    >
                      Ver conversación →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Has incoming messages? Link to chat */}
        {messages.some(m => m.apt === apt && m.direction === 'incoming') && (
          <div className="px-4 py-2 border-t border-slate-100">
            <Link
              href={`/mensajes?from=paquetes&apt=${apt}`}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#25D366] hover:text-[#1da851] py-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ver conversación completa
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Package Card ───────────────────────────────────────────────────────────

interface PackageCardProps {
  apt: string;
  packages: Package[];
  messages: WhatsAppMessage[];
  isNew?: string | null;
  lastSeenAt?: string | null;
  onDeliver: (apt: string, packageIds: string[]) => void;
}

export function PackageCard({ apt, packages, messages, isNew, lastSeenAt, onDeliver }: PackageCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasNewPkg = packages.some(p => p.id === isNew);

  useEffect(() => {
    if (hasNewPkg) {
      requestAnimationFrame(() => setBlinking(true));
      timerRef.current = setTimeout(() => setBlinking(false), 1200);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [hasNewPkg]);

  // Primary badge (most important across all packages)
  const badges = packages.map(pkg => resolveBadge(pkg, messages, lastSeenAt));
  const primaryBadge = badges.reduce((best, badge) => {
    const priority = (b: BadgeInfo) => {
      if (b.type === 'custom-msg') return 10;
      if (b.type === 'quick-reply' && b.positive) return 8;
      if (b.type === 'quick-reply') return 7;
      if (b.type === 'status' && b.icon === 'error') return 9;
      if (b.type === 'status' && b.icon === 'clock') return 5;
      if (b.type === 'status' && b.icon === 'check-check-blue') return 4;
      if (b.type === 'status' && b.icon === 'check-check') return 3;
      return 1;
    };
    return priority(badge) > priority(best) ? badge : best;
  }, badges[0]);

  // Type emojis summary
  const emojiSummary = packages.length <= 3
    ? packages.map(p => typeEmoji[p.type] ?? '📦').join(' ')
    : packages.slice(0, 2).map(p => typeEmoji[p.type] ?? '📦').join(' ') + ` +${packages.length - 2}`;

  const allIds = packages.map(p => p.id);

  return (
    <>
      <div
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        style={blinking ? { animation: 'slideIn 0.25s ease-out, blink 0.6s ease-in-out 0.25s 2' } : undefined}
      >
        {/* Card body — click to show detail */}
        <button
          onClick={() => setShowDetail(true)}
          className="w-full text-left px-3 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          {/* Apt number + count */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-black text-slate-800">{apt}</span>
            <span className="text-lg">{emojiSummary}</span>
          </div>

          {/* Badge */}
          <BadgePill badge={primaryBadge} />
        </button>

        {/* Deliver button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => onDeliver(apt, allIds)}
            className="w-full flex items-center justify-center gap-1.5 bg-[#00875A] hover:bg-[#006644] text-white py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Entregar
          </button>
        </div>
      </div>

      {/* Floating detail */}
      {showDetail && (
        <DetailPopover
          apt={apt}
          packages={packages}
          messages={messages}
          lastSeenAt={lastSeenAt}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
