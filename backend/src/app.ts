import express, { Express } from 'express';
import dotenv from 'dotenv';
import logger from './config/logger';
import { corsMiddleware } from './config/cors';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { resolveTenant } from './middlewares/tenant';
import { rateLimitPublic } from './middlewares/rateLimitPublic';
import authRoutes from './routes/auth/index';
import publicRoutes from './routes/public/index';
import tenantRoutes from './routes/tenant/index';
import superRoutes from './routes/super/index';
import legacyRoutes from './routes/legacy/index';
import webhooksRouter from './routes/webhooks/index';

dotenv.config();

const app: Express = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', rateLimitPublic as never, resolveTenant, publicRoutes);
app.use('/api/tenant', resolveTenant, tenantRoutes);
app.use('/api/super', superRoutes);
app.use('/api/legacy', legacyRoutes);
app.use('/api/webhooks', webhooksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
