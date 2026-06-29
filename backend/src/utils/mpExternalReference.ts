const PREFIX = 'tuturno:';

export function buildMpExternalReference(tenantSlug: string, turnoId: number): string {
  return `${PREFIX}${tenantSlug}:turno:${turnoId}`;
}

export function parseMpExternalReference(
  ref: string | null | undefined
): { tenantSlug: string; turnoId: number } | null {
  if (!ref || !ref.startsWith(PREFIX)) return null;
  const parts = ref.slice(PREFIX.length).split(':');
  if (parts.length !== 3 || parts[1] !== 'turno') return null;
  const turnoId = Number(parts[2]);
  if (!parts[0] || !Number.isInteger(turnoId) || turnoId <= 0) return null;
  return { tenantSlug: parts[0], turnoId };
}
