import rateLimit from 'express-rate-limit';

const windowMs = 60_000;
const max = parseInt(process.env.PUBLIC_RATE_LIMIT || '60', 10);

export const rateLimitPublic = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Intentá de nuevo en un minuto.',
    },
  },
});
