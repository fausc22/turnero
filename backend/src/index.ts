import app from './app';
import { testConnection } from './config/database';
import logger from './config/logger';
import { startExpirePendingTurnosJob } from './jobs/expirePendingTurnos';
import { startReminderCronJob } from './jobs/reminderCron';
import { startTrialExpiryCronJob } from './jobs/trialExpiryCron';

const PORT = process.env.PORT || 4013;

async function startServer() {
  try {
    await testConnection();
    logger.warn('Legacy API disponible en /api/legacy — usar /api/public|tenant|super');

    if (process.env.NODE_ENV !== 'test') {
      startExpirePendingTurnosJob();
      startReminderCronJob();
      startTrialExpiryCronJob();
    }

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en puerto ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
