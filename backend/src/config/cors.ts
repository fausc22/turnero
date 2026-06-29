import cors from 'cors';

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/([\w-]+\.)?localhost(:\d+)?$/;

function buildBaseDomainRegexes(): RegExp[] {
  const base = process.env.BASE_DOMAIN?.trim().toLowerCase().replace(/^\*\./, '').replace(/^\.+/, '');
  if (!base) return [];
  const escaped = base.replace(/\./g, '\\.');
  return [
    new RegExp(`^https?:\\/\\/[\\w-]+\\.${escaped}$`),
    new RegExp(`^https?:\\/\\/panel\\.${escaped}$`),
    new RegExp(`^https?:\\/\\/admin\\.${escaped}$`),
    new RegExp(`^https?:\\/\\/api\\.${escaped}$`),
  ];
}

function parseCorsOrigins(): (string | RegExp)[] {
  const fromEnv = process.env.CORS_ORIGINS;
  const origins: (string | RegExp)[] = [LOCALHOST_ORIGIN_REGEX, ...buildBaseDomainRegexes()];

  if (fromEnv) {
    fromEnv.split(',').forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.push(trimmed);
    });
  }

  return origins;
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowed = parseCorsOrigins();
    const ok = allowed.some((entry) =>
      typeof entry === 'string' ? entry === origin : entry.test(origin)
    );
    callback(null, ok);
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-tenant-slug',
    'x-refresh-token',
    'Idempotency-Key',
  ],
});
