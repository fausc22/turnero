function formatIcsDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

export function buildIcsEvent(params: {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
}): string {
  const uid = `${Date.now()}@tuturno.local`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TuTurno//ES',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(params.start)}`,
    `DTEND:${formatIcsDate(params.end)}`,
    `SUMMARY:${params.title}`,
  ];
  if (params.description) lines.push(`DESCRIPTION:${params.description}`);
  if (params.location) lines.push(`LOCATION:${params.location}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
