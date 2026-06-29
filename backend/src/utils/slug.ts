export const RESERVED_SUBDOMAINS = new Set([
  'panel',
  'admin',
  'api',
  'www',
  'mail',
  'ftp',
  'app',
  'static',
  'cdn',
]);

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SUBDOMAINS.has(normalizeSlug(slug));
}

export function isValidSlug(slug: string): boolean {
  const normalized = normalizeSlug(slug);
  if (!normalized || isReservedSlug(normalized)) return false;
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(normalized);
}
