import express, { Express } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import logger from './config/logger';
import { loadEnv, getEnv } from './config/env';
import { corsMiddleware } from './config/cors';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import { resolveTenant } from './middlewares/tenant';
import { rateLimitPublic } from './middlewares/rateLimitPublic';
import { rateLimitWebhook } from './middlewares/rateLimitAuth';
import { redactPath } from './config/logger';
import authRoutes from './routes/auth/index';
import publicRoutes from './routes/public/index';
import tenantRoutes from './routes/tenant/index';
import superRoutes from './routes/super/index';
import legacyRoutes from './routes/legacy/index';
import webhooksRouter from './routes/webhooks/index';
import { getAdminPool } from './config/adminDatabase';

dotenv.config();

// Fail-fast on invalid/unsafe production env at module load (except during unit tests of env itself)
if (process.env.SKIP_ENV_VALIDATION !== 'true') {
  loadEnv();
}

const app: Express = express();
const env = getEnv();

const trustHops = parseInt(env.TRUST_PROXY_HOPS || '1', 10);
app.set('trust proxy', Number.isFinite(trustHops) ? trustHops : 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(corsMiddleware);
app.use(express.json({ limit: env.BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT || '1mb' }));
app.use(requestIdMiddleware);

app.use((req, _res, next) => {
  logger.info(`${req.method} ${redactPath(req.path)}`, {
    ip: req.ip,
    requestId: req.requestId,
    path: redactPath(req.path),
  });
  next();
});

/** Liveness — process is up */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/live', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** Readiness — admin DB reachable */
app.get('/health/ready', async (_req, res) => {
  try {
    const pool = getAdminPool();
    const conn = await pool.getConnection();
    try {
      await conn.ping();
    } finally {
      conn.release();
    }
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error('readiness failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(503).json({
      status: 'not_ready',
      reason: 'admin_db',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/public', rateLimitPublic as never, resolveTenant, publicRoutes);
app.use('/api/tenant', resolveTenant, tenantRoutes);
app.use('/api/super', superRoutes);

if (env.legacyApiEnabled) {
  logger.warn('Legacy API enabled at /api/legacy — disable in production (LEGACY_API_ENABLED=false)');
  app.use('/api/legacy', legacyRoutes);
}

app.use('/api/webhooks', rateLimitWebhook as never, webhooksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
