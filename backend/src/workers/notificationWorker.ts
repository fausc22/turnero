import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { findTenantBySlug } from '../repositories/admin/tenantRepository';
import { runWithTenantContext } from '../context/tenantContext';
import * as jobRepo from '../repositories/admin/notificationJobRepository';
import * as waStatusRepo from '../repositories/admin/whatsappSessionStatusRepository';
import * as enviadaRepo from '../repositories/tenant/notificacionEnviadaRepository';
import { sendEmail } from '../services/emailService';
import { enqueueEmailFallback } from '../services/notificationEnqueueService';
import logger from '../config/logger';
import { closeAdminPool } from '../config/adminDatabase';
import { closeTenantPool } from '../config/tenantDatabase';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const POLL_MS = 2000;
const MAX_RETRIES = 3;
const RATE_LIMIT_PER_MIN = 10;
const BAILEYS_DIR = path.join(__dirname, '../../.baileys');
const RECONNECT_FLAG = path.join(BAILEYS_DIR, '.reconnect');

const tenantBuckets = new Map<string, { tokens: number; resetAt: number }>();

let waSocket: WASocket | null = null;
let shuttingDown = false;

function normalizePhone(telefono: string): string {
  const digits = telefono.replace(/\D/g, '');
  if (digits.startsWith('54')) return `${digits}@s.whatsapp.net`;
  if (digits.length === 10) return `54${digits}@s.whatsapp.net`;
  return `${digits}@s.whatsapp.net`;
}

function canSendForTenant(tenantSlug: string): boolean {
  const now = Date.now();
  let bucket = tenantBuckets.get(tenantSlug);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { tokens: RATE_LIMIT_PER_MIN, resetAt: now + 60_000 };
    tenantBuckets.set(tenantSlug, bucket);
  }
  if (bucket.tokens <= 0) return false;
  bucket.tokens -= 1;
  return true;
}

async function recordSent(
  tenantSlug: string,
  turnoId: number | null,
  tipo: string,
  canal: 'whatsapp' | 'email'
): Promise<void> {
  if (!turnoId) return;
  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant?.db_name) return;

  await runWithTenantContext(
    {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantDbName: tenant.db_name,
      plan: tenant.plan,
      pageStatus: tenant.page_status,
      config: tenant.config_json ?? {},
    },
    () => enviadaRepo.record(turnoId, tipo, canal)
  );
}

async function sendWhatsapp(telefono: string, body: string): Promise<void> {
  if (!waSocket) throw new Error('WhatsApp no conectado');
  const jid = normalizePhone(telefono);
  await waSocket.sendMessage(jid, { text: body });
}

async function processJob(job: jobRepo.NotificationJobRow): Promise<void> {
  if (!canSendForTenant(job.tenant_slug)) {
    await jobRepo.resetToPending(job.id);
    return;
  }

  const payload = job.payload as { body: string; subject?: string };

  try {
    if (job.canal === 'whatsapp') {
      if (!job.telefono) throw new Error('Sin teléfono');
      await sendWhatsapp(job.telefono, payload.body);
    } else {
      if (!job.email) throw new Error('Sin email');
      await sendEmail({
        to: job.email,
        subject: payload.subject ?? 'TuTurno',
        html: payload.body,
      });
    }

    await jobRepo.markSent(job.id);
    await recordSent(job.tenant_slug, job.turno_id, job.tipo, job.canal);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const retries = await jobRepo.incrementRetry(job.id, message);

    if (job.canal === 'whatsapp' && retries >= MAX_RETRIES && job.turno_id) {
      await jobRepo.markFailed(job.id, message);
      await enqueueEmailFallback(
        job.tenant_slug,
        job.turno_id,
        job.tipo as import('../services/notificationEnqueueService').NotificationTipo
      );
    } else if (retries >= MAX_RETRIES) {
      await jobRepo.markFailed(job.id, message);
    }
  }
}

async function pollJobs(): Promise<void> {
  const workerId = process.env.WORKER_ID || `worker-${process.pid}`;
  const jobs = await jobRepo.claimNext(1, workerId);
  for (const job of jobs) {
    if (shuttingDown) {
      await jobRepo.resetToPending(job.id);
      continue;
    }
    await processJob(job);
  }
}

async function startBaileys(): Promise<void> {
  if (!fs.existsSync(BAILEYS_DIR)) {
    fs.mkdirSync(BAILEYS_DIR, { recursive: true });
  }

  if (fs.existsSync(RECONNECT_FLAG)) {
    fs.rmSync(RECONNECT_FLAG, { force: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(BAILEYS_DIR);

  waSocket = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  waSocket.ev.on('creds.update', saveCreds);

  waSocket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\nEscaneá este QR con WhatsApp:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      const phone = waSocket?.user?.id?.split(':')[0] ?? null;
      await waStatusRepo.setConnected(phone);
      logger.info('WhatsApp conectado', { phone });
    }

    if (connection === 'close') {
      await waStatusRepo.setDisconnected();
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output
        ?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && !shuttingDown;

      if (shouldReconnect) {
        logger.warn('WhatsApp desconectado, reconectando...');
        setTimeout(() => {
          void startBaileys();
        }, 3000);
      }
    }
  });
}

async function main(): Promise<void> {
  logger.info('notificationWorker iniciado');
  await startBaileys();

  const interval = setInterval(() => {
    void pollJobs().catch((err) => {
      logger.error('pollJobs error', { error: err instanceof Error ? err.message : String(err) });
    });
  }, POLL_MS);

  const shutdown = async () => {
    shuttingDown = true;
    clearInterval(interval);
    waSocket?.end(undefined);
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

  if (fs.existsSync(RECONNECT_FLAG)) {
    fs.watch(RECONNECT_FLAG, () => {
      logger.info('Flag reconnect detectado, reiniciando sesión WA');
      waSocket?.end(undefined);
      void startBaileys();
    });
  }
}

main().catch((err) => {
  logger.error('notificationWorker fatal', { error: err });
  process.exit(1);
});
