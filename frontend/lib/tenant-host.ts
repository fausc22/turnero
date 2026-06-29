const RESERVED = ['panel', 'admin', 'api', 'www', 'mail', 'ftp', 'app', 'static', 'cdn'];

/** Dominio raíz prod, ej. tuturno.com (sin protocolo ni wildcard). */
export function getBaseDomain(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_BASE_DOMAIN?.trim().toLowerCase();
  if (!raw) return undefined;
  return raw.replace(/^\*\./, '').replace(/^\.+/, '');
}

/**
 * Extrae slug de tenant desde hostname.
 * Dev: peluqueria-naz.localhost
 * Prod: peluqueria-naz.{BASE_DOMAIN}
 */
export function extractTenantSlugFromHostname(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') return null;

  const baseDomain = getBaseDomain();
  let slug: string | null = null;

  if (host.endsWith('.localhost')) {
    slug = host.replace(/\.localhost$/, '');
  } else if (baseDomain && host.endsWith(`.${baseDomain}`)) {
    slug = host.slice(0, -(baseDomain.length + 1));
    if (slug.includes('.')) return null;
  } else {
    return null;
  }

  if (!slug || RESERVED.includes(slug)) return null;
  return slug;
}
