import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60_000;
const max = parseInt(process.env.AUTH_RATE_LIMIT || '10', 10);

export const rateLimitAuth = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de autenticación. Intentá de nuevo más tarde.',
    },
  },
});

const webhookMax = parseInt(process.env.WEBHOOK_RATE_LIMIT || '120', 10);

export const rateLimitWebhook = rateLimit({
  windowMs: 60_000,
  max: webhookMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas notificaciones de webhook.',
    },
  },
});
