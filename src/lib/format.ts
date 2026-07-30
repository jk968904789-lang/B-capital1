export function formatEtb(amount: number): string {
  const n = Number(amount);
  if (isNaN(n)) return '— ETB';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n)) + ' ETB';
}

export function formatEtbPlain(amount: number): string {
  const n = Number(amount);
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/**
 * Formats a date string or Date for display.
 * Date-only strings (e.g. "2024-01-15") are parsed as LOCAL time to avoid
 * timezone shifts that would show the wrong day.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateLocal(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateLocal(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = parseDateLocal(checkIn);
  const end = parseDateLocal(checkOut);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/** Returns today's date as a local YYYY-MM-DD string (not UTC). */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Adds days to a date string, returning a local YYYY-MM-DD string. */
export function addDays(iso: string, days: number): string {
  const d = parseDateLocal(iso);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isFutureOrToday(iso: string): boolean {
  return iso >= todayISO();
}

/**
 * Parses a date string as a local Date.
 * Date-only strings ("2024-01-15") are treated as local midnight.
 * Full ISO strings with timezone ("2024-01-15T10:00:00Z") are parsed normally.
 */
function parseDateLocal(date: string): Date {
  // If the string is date-only (YYYY-MM-DD), append local midnight to avoid UTC interpretation
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(date + 'T00:00:00');
  }
  return new Date(date);
}
