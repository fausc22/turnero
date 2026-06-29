const DEFAULT_TZ = 'America/Argentina/Buenos_Aires';

export function getDefaultTimezone(): string {
  return DEFAULT_TZ;
}

/** Combina fecha YYYY-MM-DD + hora HH:mm:ss en Date UTC aproximado para comparaciones. */
export function combineDateAndTime(fecha: string, hora: string, _timezone = DEFAULT_TZ): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm, ss = '0'] = hora.split(':');
  return new Date(y, m - 1, d, parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10));
}

export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
