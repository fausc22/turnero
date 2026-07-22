import rateLimit from 'express-rate-limit';

const windowMs = 60_000;
const max = parseInt(process.env.PUBLIC_RATE_LIMIT || '60', 10);

export const rateLimitPublic = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keyGenerator: (req: any) => {
    const slug = String(req.headers?.['x-tenant-slug'] || '').toLowerCase();
    return `${req.ip || 'unknown'}:${slug}`;
  },
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.',
    },
  },
});
