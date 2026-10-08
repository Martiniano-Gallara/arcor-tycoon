/**
 * Utilidades de Sanitización y Seguridad para prevenir XSS y validar datos no confiables
 */

/**
 * Escapa caracteres HTML especiales para evitar inyección en templates (SEC-02)
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface SanitizedGiftBoxItem {
  type: string;
  x: number;
  y: number;
  r: number;
}

export interface SanitizedGiftBoxPayload {
  t: string;  // toPerson
  f: string;  // fromPerson
  m: string;  // message
  r: string;  // ribbon
  d: string;  // design
  th: string; // theme
  p: SanitizedGiftBoxItem[];
}

const ALLOWED_CANDY_TYPES = new Set([
  'bonobon',
  'bonobon_blanco',
  'caramelo_1951',
  'cofler',
  'mogul',
  'rocklets',
  'tofi',
  'chocolinas',
  'criollitas',
  'aguila',
  'butter_toffees',
  'holanda',
  'frutales',
  'menta_cristal'
]);

const ALLOWED_DESIGNS = new Set(['dorada_lujo', 'arcorito_festivo', 'vintage_arroyito', 'dulce_compartir']);
const ALLOWED_THEMES = new Set(['navidad', 'aniversario', 'amor', 'clasico']);
const ALLOWED_RIBBONS = new Set(['dorado', 'rojo', 'azul', 'arcoiris']);

/**
 * Valida y sanitiza exhaustivamente el payload de una caja compartida (#box=...) (SEC-01, SEC-03)
 */
export function sanitizeSharedGiftBox(raw: any): SanitizedGiftBoxPayload | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  // ToPerson (max 60 caracteres)
  const toPerson = typeof raw.t === 'string'
    ? raw.t.trim().slice(0, 60)
    : 'Alguien Muy Especial';

  // FromPerson (max 60 caracteres)
  const fromPerson = typeof raw.f === 'string'
    ? raw.f.trim().slice(0, 60)
    : 'Un Amigo';

  // Dedication message (max 200 caracteres)
  const message = typeof raw.m === 'string'
    ? raw.m.trim().slice(0, 200)
    : '¡Un mundo más dulce para vos!';

  // Design, Theme, Ribbon restringidos a la lista permitida
  const design = ALLOWED_DESIGNS.has(raw.d) ? raw.d : 'dorada_lujo';
  const theme = ALLOWED_THEMES.has(raw.th) ? raw.th : 'aniversario';
  const ribbon = ALLOWED_RIBBONS.has(raw.r) ? raw.r : 'dorado';

  // Items (array limitado a un máximo de 12 elementos reales)
  const items: SanitizedGiftBoxItem[] = [];
  if (Array.isArray(raw.p)) {
    const rawItems = raw.p.slice(0, 12);
    for (const item of rawItems) {
      if (item && typeof item === 'object') {
        const type = String(item.t);
        if (ALLOWED_CANDY_TYPES.has(type)) {
          const x = Number(item.x);
          const y = Number(item.y);
          const r = Number(item.r);

          items.push({
            type,
            x: Number.isFinite(x) ? Math.max(5, Math.min(95, x)) : 50,
            y: Number.isFinite(y) ? Math.max(5, Math.min(95, y)) : 50,
            r: Number.isFinite(r) ? Math.max(-180, Math.min(180, r)) : 0
          });
        }
      }
    }
  }

  return {
    t: toPerson,
    f: fromPerson,
    m: message,
    d: design,
    th: theme,
    r: ribbon,
    p: items
  };
}
