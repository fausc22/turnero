import winston from 'winston';

const SENSITIVE_KEYS = /password|secret|token|authorization|cookie|smtp_pass|access_token|refresh/i;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /\b(?:\+?54)?[0-9]{8,15}\b/g;
const BEARER_RE = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const JWT_RE = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

export function redactString(value: string): string {
  return value
    .replace(BEARER_RE, 'Bearer [REDACTED]')
    .replace(JWT_RE, '[REDACTED_JWT]')
    .replace(EMAIL_RE, '[REDACTED_EMAIL]')
    .replace(PHONE_RE, '[REDACTED_PHONE]');
}

export function redactPath(path: string): string {
  return path
    .replace(/\/reservas\/[^/?]+/g, '/reservas/[TOKEN]')
    .replace(/([?&]token=)[^&]+/gi, '$1[REDACTED]')
    .replace(/([?&]sig=)[^&]+/gi, '$1[REDACTED]');
}

export function redactMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.test(key)) {
      out[key] = '[REDACTED]';
      continue;
    }
    if (typeof value === 'string') {
      out[key] = key === 'path' ? redactPath(value) : redactString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = redactMeta(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

const redactFormat = winston.format((info) => {
  const { level, message, ...rest } = info;
  const cleaned = redactMeta(rest as Record<string, unknown>);
  return {
    ...cleaned,
    level,
    message: typeof message === 'string' ? redactString(message) : message,
  };
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  redactFormat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'turnero-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), redactFormat(), winston.format.json()),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const cleaned = redactMeta(meta as Record<string, unknown>);
          const msg = typeof message === 'string' ? redactString(message) : String(message);
          return `${timestamp} [${level}]: ${msg} ${
            Object.keys(cleaned).length ? JSON.stringify(cleaned, null, 2) : ''
          }`;
        })
      ),
    })
  );
}

export default logger;
