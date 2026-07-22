import path from 'path';
import dotenv from 'dotenv';
import logger from '../config/logger';
import { getEnv, loadEnv } from '../config/env';
import { closeAdminPool, getAdminConnection } from '../config/adminDatabase';
import { closeTenantPool } from '../config/tenantDatabase';
import { expirePendingTurnos } from './expirePendingTurnos';
import { runReminderCron } from './reminderCron';
import { processTrialExpiry } from './trialExpiryCron';
import { RowDataPacket } from 'mysql2';

dotenv.config({ path: path.join(__dirname, '../../.env') });
loadEnv();

const env = getEnv();
const LOCK_NAME = env.SCHEDULER_LOCK_NAME || 'tuturno-scheduler';
let shuttingDown = false;
const timers: NodeJS.Timeout[] = [];

async function withSchedulerLock(fn: () => Promise<void>): Promise<boolean> {
  const conn = await getAdminConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(`SELECT GET_LOCK(?, 0) AS got`, [LOCK_NAME]);
    if (!rows[0] || Number(rows[0].got) !== 1) {
      return false;
    }
    try {
      await fn();
    } finally {
      await conn.query(`SELECT RELEASE_LOCK(?)`, [LOCK_NAME]);
    }
    return true;
  } finally {
    conn.release();
  }
}

async function recordHeartbeat(jobName: string, error?: string): Promise<void> {
  const conn = await getAdminConnection();
  try {
    await conn.execute(
      `INSERT INTO scheduler_heartbeats (job_name, last_run_at, last_success_at, last_error)
       VALUES (?, NOW(), IF(? IS NULL, NOW(), NULL), ?)
       ON DUPLICATE KEY UPDATE
         last_run_at = NOW(),
         last_success_at = IF(? IS NULL, NOW(), last_success_at),
         last_error = VALUES(last_error)`,
      [jobName, error ?? null, error ?? null, error ?? null]
    );
  } catch (err) {
    logger.warn('heartbeat write failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    conn.release();
  }
}

async function recoverStuckJobs(): Promise<void> {
  const conn = await getAdminConnection();
  try {
    const [result] = await conn.execute(
      `UPDATE notification_jobs
       SET status = 'pending', claimed_at = NULL, worker_id = NULL
       WHERE status = 'processing'
         AND (claimed_at IS NULL OR claimed_at < NOW() - INTERVAL 10 MINUTE)`
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected > 0) {
      logger.info(`Recovered ${affected} stuck notification jobs`);
    }
  } finally {
    conn.release();
  }
}

function schedule(name: string, intervalMs: number, fn: () => Promise<void>): void {
  const run = () => {
    if (shuttingDown) return;
    void withSchedulerLock(async () => {
      try {
        await fn();
        await recordHeartbeat(name);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`scheduler job ${name} failed`, { error: message });
        await recordHeartbeat(name, message);
      }
    });
  };
  run();
  timers.push(setInterval(run, intervalMs));
}

async function main(): Promise<void> {
  logger.info('tuturno-scheduler started', { lock: LOCK_NAME });

  schedule('expirePendingTurnos', 5 * 60_000, expirePendingTurnos);
  schedule('reminders', 15 * 60_000, runReminderCron);
  schedule('trialExpiry', 24 * 60 * 60_000, processTrialExpiry);
  schedule('recoverStuckJobs', 60_000, recoverStuckJobs);

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const t of timers) clearInterval(t);
    await closeTenantPool();
    await closeAdminPool();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });
  process.on('SIGTERM', () => {
    void shutdown();
  });
}

main().catch((err) => {
  logger.error('scheduler fatal', { error: err });
  process.exit(1);
});
