import { PackageType } from '@/types';

export interface VoiceCommand {
  action: 'register' | 'deliver' | 'unknown';
  type?: PackageType;
  apt?: string;
  provider?: string;
}

// Mapeo de palabras habladas a tipos
const TYPE_KEYWORDS: Record<string, PackageType> = {
  'paquete': 'normal',
  'paquetes': 'normal',
  'caja': 'normal',
  'encomienda': 'normal',
  'sobre': 'normal',
  'supermercado': 'supermercado',
  'super': 'supermercado',
  'mercado': 'supermercado',
  'compras': 'supermercado',
  'comida': 'food',
  'delivery': 'food',
  'pedido': 'food',
  'food': 'food',
  'otro': 'other',
  'otros': 'other',
  'documento': 'other',
};

// Proveedores reconocibles por voz
const PROVIDER_KEYWORDS: Record<string, string> = {
  'mercado libre': 'Mercado Libre',
  'mercadolibre': 'Mercado Libre',
  'falabella': 'Falabella',
  'ripley': 'Ripley',
  'paris': 'Paris',
  'amazon': 'Amazon',
  'shein': 'Shein',
  'chilexpress': 'Chilexpress',
  'starken': 'Starken',
  'correos': 'Correos de Chile',
  'jumbo': 'Jumbo',
  'líder': 'Lider',
  'lider': 'Lider',
  'santa isabel': 'Santa Isabel',
  'tottus': 'Tottus',
  'cornershop': 'Cornershop',
  'uber eats': 'Uber Eats',
  'uber': 'Uber Eats',
  'rappi': 'Rappi',
  'pedidos ya': 'PedidosYa',
};

// Palabras habladas a digitos
const SPOKEN_NUMBERS: Record<string, string> = {
  'cero': '0', 'uno': '1', 'una': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
  'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9',
  'diez': '10', 'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14',
  'quince': '15', 'dieciséis': '16', 'dieciseis': '16', 'diecisiete': '17',
  'dieciocho': '18', 'diecinueve': '19', 'veinte': '20', 'veintiuno': '21',
  'veintiún': '21', 'veintidós': '22', 'veintidos': '22', 'veintitrés': '23',
  'veintitres': '23',
};

/**
 * Normaliza el texto reemplazando palabras numéricas por dígitos
 * y juntando números separados por espacios.
 * Ej: "veintitrés cero tres" → "2303"
 *     "23 03" → "2303"
 *     "paquete para el 15 02" → "paquete para el 1502"
 */
function normalizeNumbers(text: string): string {
  let result = text.toLowerCase();

  // Paso 1: reemplazar palabras habladas por sus dígitos
  // Ordenar por longitud descendente para que "veintitrés" se capture antes que "tres"
  const sortedWords = Object.entries(SPOKEN_NUMBERS).sort((a, b) => b[0].length - a[0].length);
  for (const [word, digits] of sortedWords) {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), digits);
  }

  // Paso 2: juntar números separados por espacios → "23 03" → "2303", "15 02" → "1502"
  result = result.replace(/(\d+)(\s+(\d+))+/g, (match) => {
    return match.replace(/\s+/g, '');
  });

  return result;
}

function extractApt(text: string): string | undefined {
  const normalized = normalizeNumbers(text);

  // Buscar patron "depto/departamento/depa + numero"
  const deptoMatch = normalized.match(/(?:depto|departamento|depa)\.?\s*(\d{2,5})/i);
  if (deptoMatch) return deptoMatch[1];

  // Buscar "para el NUMERO" o "al NUMERO"
  const paraMatch = normalized.match(/(?:para el|al|para)\s+(\d{2,5})/i);
  if (paraMatch) return paraMatch[1];

  // Buscar cualquier numero de 3+ digitos (probable depto)
  const numberMatch = normalized.match(/\b(\d{3,5})\b/);
  if (numberMatch) return numberMatch[1];

  // Fallback: dos digitos si no hay nada mejor (ej: depto 03)
  const shortMatch = normalized.match(/\b(\d{2,5})\b/);
  if (shortMatch) return shortMatch[1];

  return undefined;
}

function extractType(text: string): PackageType | undefined {
  const lower = text.toLowerCase();
  for (const [keyword, type] of Object.entries(TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) return type;
  }
  return undefined;
}

function extractProvider(text: string): string | undefined {
  const lower = text.toLowerCase();
  // Primero buscar frases mas largas (ej: "mercado libre" antes que "mercado")
  const sorted = Object.entries(PROVIDER_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, provider] of sorted) {
    if (lower.includes(keyword)) return provider;
  }
  return undefined;
}

function extractAction(text: string): 'register' | 'deliver' | 'unknown' {
  const lower = text.toLowerCase();
  if (/\b(entregar|entrega|retir[oa]|retirar)\b/.test(lower)) return 'deliver';
  if (/\b(registrar|registro|lleg[oó]|recib[ií]|anotar|paquete|super|comida|delivery)\b/.test(lower)) return 'register';
  return 'unknown';
}

// ─── Parser de visitas ─────────────────────────────────────────────────────

export interface VisitVoiceCommand {
  apt?: string;
  visitorName?: string;
  type?: 'personal' | 'empleada' | 'mantencion';
}

const VISIT_TYPE_KEYWORDS: Record<string, 'personal' | 'empleada' | 'mantencion'> = {
  'visita': 'personal',
  'personal': 'personal',
  'empleada': 'empleada',
  'nana': 'empleada',
  'asesora': 'empleada',
  'mantención': 'mantencion',
  'mantencion': 'mantencion',
  'técnico': 'mantencion',
  'tecnico': 'mantencion',
  'gasfíter': 'mantencion',
  'gasfiter': 'mantencion',
  'electricista': 'mantencion',
};

function extractVisitName(text: string): string | undefined {
  const normalized = normalizeNumbers(text);

  // Quitar el numero del depto del texto para no confundirlo con el nombre
  const withoutNumbers = normalized.replace(/\b\d{2,5}\b/g, '').trim();

  // Buscar nombre despues de coma: "visita para el 2303, Juan Martinez"
  const commaMatch = text.match(/,\s*(.+)/i);
  if (commaMatch) {
    const name = commaMatch[1].trim();
    if (name.length >= 2) return capitalizeWords(name);
  }

  // Buscar "se llama / nombre / es" + nombre
  const nameMatch = text.match(/(?:se llama|nombre|llamad[oa]|es)\s+(.+)/i);
  if (nameMatch) {
    const name = nameMatch[1].trim().replace(/\b\d+\b/g, '').trim();
    if (name.length >= 2) return capitalizeWords(name);
  }

  return undefined;
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export function parseVisitVoiceCommand(transcript: string): VisitVoiceCommand {
  const apt = extractApt(transcript);
  const visitorName = extractVisitName(transcript);

  const lower = transcript.toLowerCase();
  let type: 'personal' | 'empleada' | 'mantencion' | undefined;
  for (const [keyword, t] of Object.entries(VISIT_TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) { type = t; break; }
  }

  // Default a personal si detectamos algo
  if (!type && (apt || visitorName)) type = 'personal';

  return { apt, visitorName, type };
}

// ─── Parser de paquetes ────────────────────────────────────────────────────

export function parseVoiceCommand(transcript: string): VoiceCommand {
  const action = extractAction(transcript);
  const type = extractType(transcript);
  const apt = extractApt(transcript);
  const provider = extractProvider(transcript);

  // Si detectamos un proveedor de super, inferir tipo
  const inferredType = type ?? (provider && ['Jumbo', 'Lider', 'Santa Isabel', 'Tottus', 'Cornershop'].includes(provider)
    ? 'supermercado'
    : provider && ['Uber Eats', 'Rappi', 'PedidosYa'].includes(provider)
    ? 'food'
    : undefined);

  return {
    action: action === 'unknown' && (inferredType || apt) ? 'register' : action,
    type: inferredType,
    apt,
    provider,
  };
}
