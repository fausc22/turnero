import app from './app';
import { testConnection } from './config/database';
import { getEnv } from './config/env';
import logger from './config/logger';
import { startExpirePendingTurnosJob } from './jobs/expirePendingTurnos';
import { startReminderCronJob } from './jobs/reminderCron';
import { startTrialExpiryCronJob } from './jobs/trialExpiryCron';
import { closeAdminPool } from './config/adminDatabase';
import { closeTenantPool } from './config/tenantDatabase';
import type { Server } from 'http';

const env = getEnv();
const PORT = env.PORT || process.env.PORT || 4013;

let server: Server | null = null;
let shuttingDown = false;

async function startServer() {
  try {
    await testConnection();

    if (env.legacyApiEnabled) {
      logger.warn('Legacy API disponible en /api/legacy — usar /api/public|tenant|super');
    }

    if (env.NODE_ENV !== 'test' && env.runCronsInApi) {
      startExpirePendingTurnosJob();
      startReminderCronJob();
      startTrialExpiryCronJob();
      logger.info('Crons iniciados en proceso API (RUN_CRONS_IN_API)');
    } else if (env.NODE_ENV !== 'test') {
      logger.info('Crons no iniciados en API — usar tuturno-scheduler');
    }

    server = app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      logger.info(`Ambiente: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Shutdown iniciado (${signal})`);

  const forceTimer = setTimeout(() => {
    logger.error('Shutdown forzado por timeout');
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await closeTenantPool();
    await closeAdminPool();
    logger.info('Shutdown completo');
    process.exit(0);
  } catch (err) {
    logger.error('Error en shutdown', { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

startServer();
