import { headers } from 'next/headers';
import { extractTenantSlugFromHostname } from './tenant-host';

export async function getTenantSlugFromHeaders(): Promise<string | null> {
  const h = await headers();
  return h.get('x-tenant-slug');
}

export function getTenantSlugFromHost(host: string): string | null {
  return extractTenantSlugFromHostname(host.split(':')[0]);
}

export function formatTenantDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
