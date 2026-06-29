import { findTenantBySlug } from '../repositories/admin/tenantRepository';
import { runWithTenantContext } from '../context/tenantContext';
import * as jobRepo from '../repositories/admin/notificationJobRepository';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as plantillaRepo from '../repositories/tenant/plantillaNotificacionRepository';
import * as enviadaRepo from '../repositories/tenant/notificacionEnviadaRepository';
import { getTenantMeta } from '../repositories/tenant/tenantMetaRepository';
import { renderTemplate, renderEmailTemplate } from '../utils/templateRenderer';
import { buildNotificationVars } from '../utils/notificationVars';
import logger from '../config/logger';
import type { PlantillaTipo } from '../repositories/tenant/plantillaNotificacionRepository';

export type NotificationTipo =
  | PlantillaTipo
  | 'confirmacion_reenvio'
  | 'lista_espera';

const EMAIL_SUBJECTS: Record<string, string> = {
  confirmacion: 'Turno confirmado',
  confirmacion_reenvio: 'Confirmación de turno',
  cancelacion: 'Turno cancelado',
  recordatorio_24h: 'Recordatorio: tu turno es mañana',
  recordatorio_2h: 'Recordatorio: tu turno es en 2 horas',
};

function featureEnabled(
  config: { features?: Record<string, unknown> },
  key: string,
  defaultVal = true
): boolean {
  const features = config.features as Record<string, unknown> | undefined;
  if (features && key in features) return Boolean(features[key]);
  return defaultVal;
}

function resolvePlantillaTipo(tipo: NotificationTipo): PlantillaTipo {
  if (tipo === 'confirmacion_reenvio') return 'confirmacion';
  return tipo as PlantillaTipo;
}

function renderBody(
  plantillaCuerpo: string,
  tipo: NotificationTipo,
  canal: 'whatsapp' | 'email',
  vars: Record<string, string>
): { body: string; subject?: string } {
  if (canal === 'email') {
    const fileRef = plantillaCuerpo.startsWith('@file:')
      ? plantillaCuerpo.slice(6)
      : resolvePlantillaTipo(tipo) === 'recordatorio_2h' || resolvePlantillaTipo(tipo) === 'recordatorio_24h'
        ? 'recordatorio'
        : resolvePlantillaTipo(tipo);
    const html =
      plantillaCuerpo.startsWith('@file:') || plantillaCuerpo === '@file:confirmacion'
        ? renderEmailTemplate(
            fileRef === 'confirmacion' || fileRef === 'cancelacion' || fileRef === 'recordatorio'
              ? fileRef
              : resolvePlantillaTipo(tipo) === 'cancelacion'
                ? 'cancelacion'
                : resolvePlantillaTipo(tipo).startsWith('recordatorio')
                  ? 'recordatorio'
                  : 'confirmacion',
            vars
          )
        : renderTemplate(plantillaCuerpo, vars);
    return {
      body: html,
      subject: EMAIL_SUBJECTS[tipo] ?? EMAIL_SUBJECTS[resolvePlantillaTipo(tipo)] ?? 'TuTurno',
    };
  }
  return { body: renderTemplate(plantillaCuerpo, vars) };
}

export interface EnqueueForTurnoInput {
  tenantSlug: string;
  turnoId: number;
  tipo: NotificationTipo;
  preferEmail?: boolean;
  skipDuplicateCheck?: boolean;
  customMessage?: string;
}

export async function enqueueForTurno(input: EnqueueForTurnoInput): Promise<void> {
  try {
    const tenant = await findTenantBySlug(input.tenantSlug);
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
      async () => {
        const ctx = tenant.config_json ?? {};
        const whatsappOn = featureEnabled(ctx, 'whatsapp', true);
        const recordatoriosOn = featureEnabled(ctx, 'whatsapp_recordatorios', true);

        if (input.tipo.startsWith('recordatorio') && !recordatoriosOn) return;

        if (
          !input.skipDuplicateCheck &&
          input.tipo !== 'confirmacion_reenvio' &&
          (await enviadaRepo.wasSent(input.turnoId, input.tipo))
        ) {
          return;
        }

        const turno = await turnoRepo.findById(input.turnoId);
        if (!turno) return;

        const meta = await getTenantMeta();
        const vars = buildNotificationVars(
          {
            clienteNombre: turno.cliente_nombre,
            fechaInicio: new Date(turno.fecha_inicio),
            tokenGestion: turno.token_gestion,
          },
          meta
        );

        const plantillaTipo = resolvePlantillaTipo(input.tipo);
        const telefono = turno.cliente_telefono;
        const email = turno.cliente_email;

        const enqueueJob = async (canal: 'whatsapp' | 'email', body: string, subject?: string) => {
          await jobRepo.enqueue({
            tenantSlug: input.tenantSlug,
            turnoId: input.turnoId,
            tipo: input.tipo,
            canal,
            telefono: canal === 'whatsapp' ? telefono : null,
            email: email ?? null,
            payload: { body, subject, vars },
          });
        };

        if (input.customMessage) {
          if (whatsappOn && telefono && !input.preferEmail) {
            await enqueueJob('whatsapp', input.customMessage);
          } else if (email) {
            await enqueueJob('email', input.customMessage, 'Hay un turno disponible');
          }
          return;
        }

        if (input.preferEmail || !whatsappOn || !telefono) {
          if (!email) return;
          const plantilla = await plantillaRepo.findByTipoCanal(plantillaTipo, 'email');
          const { body, subject } = renderBody(
            plantilla?.cuerpo ?? '@file:confirmacion',
            input.tipo,
            'email',
            vars
          );
          await enqueueJob('email', body, subject);
          return;
        }

        const waPlantilla = await plantillaRepo.findByTipoCanal(plantillaTipo, 'whatsapp');
        const defaultWa =
          plantillaRepo.DEFAULT_PLANTILLAS.find(
            (p) => p.tipo === plantillaTipo && p.canal === 'whatsapp'
          )?.cuerpo ?? 'Hola {{clienteNombre}}!';
        const { body } = renderBody(waPlantilla?.cuerpo ?? defaultWa, input.tipo, 'whatsapp', vars);
        await enqueueJob('whatsapp', body);

        if (email) {
          const plantilla = await plantillaRepo.findByTipoCanal(plantillaTipo, 'email');
          const rendered = renderBody(
            plantilla?.cuerpo ?? '@file:confirmacion',
            input.tipo,
            'email',
            vars
          );
          // Email solo como fallback en worker; no encolar email aquí por defecto
          void rendered;
        }
      }
    );
  } catch (err) {
    logger.error('notificationEnqueueService.enqueueForTurno', {
      error: err instanceof Error ? err.message : String(err),
      tenantSlug: input.tenantSlug,
      turnoId: input.turnoId,
      tipo: input.tipo,
    });
  }
}

export async function enqueueEmailFallback(
  tenantSlug: string,
  turnoId: number,
  tipo: NotificationTipo
): Promise<void> {
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
    async () => {
      if (await enviadaRepo.wasSent(turnoId, tipo, 'email')) return;

      const turno = await turnoRepo.findById(turnoId);
      if (!turno?.cliente_email) return;
      const email = turno.cliente_email;

      const meta = await getTenantMeta();
      const vars = buildNotificationVars(
        {
          clienteNombre: turno.cliente_nombre,
          fechaInicio: new Date(turno.fecha_inicio),
          tokenGestion: turno.token_gestion,
        },
        meta
      );

      const plantillaTipo = resolvePlantillaTipo(tipo);
      const plantilla = await plantillaRepo.findByTipoCanal(plantillaTipo, 'email');
      const { body, subject } = renderBody(
        plantilla?.cuerpo ?? '@file:confirmacion',
        tipo,
        'email',
        vars
      );

      await jobRepo.enqueue({
        tenantSlug,
        turnoId,
        tipo,
        canal: 'email',
        email,
        payload: { body, subject, vars },
      });
    }
  );
}
