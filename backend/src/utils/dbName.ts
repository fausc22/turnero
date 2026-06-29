const DB_NAME_PATTERN = /^[a-z0-9_]+$/;

export function sanitizeDbName(name: string): string | null {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed || !DB_NAME_PATTERN.test(trimmed)) return null;
  if (trimmed.length > 64) return null;
  return trimmed;
}

export function tenantDbNameFromSlug(slug: string): string {
  const safe = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  return `tuturno_${safe.replace(/-/g, '_')}`;
}
