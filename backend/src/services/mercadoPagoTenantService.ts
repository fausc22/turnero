import axios from 'axios';
import { getTenantContext } from '../context/tenantContext';
import * as politicasRepo from '../repositories/tenant/politicasRepository';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as pagoRepo from '../repositories/tenant/pagoRepository';
import { withTenantTransaction } from '../config/tenantDatabase';
import { runWithTenantContext } from '../context/tenantContext';
import { findTenantBySlug } from '../repositories/admin/tenantRepository';
import { broadcastTenantEvent } from './sseBroadcast';
import { onTurnoConfirmado } from './turnoNotificationHooks';
import { buildMpExternalReference, parseMpExternalReference } from '../utils/mpExternalReference';
import { calcMontoPago, isPagoOnlineConfigured } from '../utils/calcMontoPago';
import { verifyMpWebhookSignature } from '../utils/mpWebhookSignature';
import { AppError, NotFoundError } from '../utils/errors';

const MP_API_URL = 'https://api.mercadopago.com';

function clientBaseUrl(tenantSlug: string): string {
  const host = process.env.CLIENT_BASE_HOST || 'localhost:4010';
  const scheme =
    process.env.CLIENT_BASE_SCHEME || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  return `${scheme}://${tenantSlug}.${host}`;
}

async function mpRequest<T>(
  accessToken: string,
  method: string,
  endpoint: string,
  data?: unknown
): Promise<T> {
  try {
    const response = await axios({
      method,
      url: `${MP_API_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data as T;
  } catch (error: unknown) {
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error instanceof Error ? error.message : 'Error Mercado Pago');
    throw new AppError(502, 'MP_API_ERROR', msg);
  }
}

export async function createPreference(input: { turnoId: number; tokenGestion: string }) {
  const ctx = getTenantContext();
  if (!ctx) throw new AppError(500, 'CONFIG_ERROR', 'Sin contexto tenant');

  const politicas = await politicasRepo.getPoliticas();
  if (!politicas || !isPagoOnlineConfigured(politicas)) {
    throw new AppError(400, 'MP_NOT_CONFIGURED', 'Mercado Pago no está configurado');
  }

  const turno = await turnoRepo.findById(input.turnoId);
  if (!turno) throw new NotFoundError('Turno');

  if (turno.token_gestion !== input.tokenGestion) {
    throw new AppError(403, 'INVALID_TOKEN', 'Token de gestión inválido');
  }

  if (turno.estado !== 'PENDIENTE') {
    throw new AppError(409, 'TURNO_NOT_PENDING', 'El turno no está pendiente de pago');
  }

  const precioTotal = Number(turno.precio_total);
  const monto = calcMontoPago(
    politicas.modo_pago,
    precioTotal,
    politicas.seña_porcentaje,
    politicas.seña_monto_fijo
  );

  const base = clientBaseUrl(ctx.tenantSlug);
  const token = encodeURIComponent(input.tokenGestion);
  const apiUrl = process.env.API_PUBLIC_URL || process.env.API_URL || 'http://api.localhost:4013';

  const preference = {
    items: [
      {
        title: `Turno #${input.turnoId} — ${ctx.tenantSlug}`,
        quantity: 1,
        unit_price: monto,
        currency_id: 'ARS',
      },
    ],
    external_reference: buildMpExternalReference(ctx.tenantSlug, input.turnoId),
    notification_url: `${apiUrl}/api/webhooks/mercadopago?tenant=${encodeURIComponent(ctx.tenantSlug)}`,
    back_urls: {
      success: `${base}/pago/exito?token=${token}`,
      failure: `${base}/pago/error?token=${token}&turnoId=${input.turnoId}`,
      pending: `${base}/pago/pendiente?token=${token}`,
    },
    auto_return: 'approved',
  };

  const result = await mpRequest<{
    id: string;
    init_point: string;
    sandbox_init_point: string;
  }>(politicas.mp_access_token!, 'POST', '/checkout/preferences', preference);

  const useSandbox = process.env.NODE_ENV !== 'production';
  return {
    id: result.id,
    initPoint: useSandbox ? result.sandbox_init_point || result.init_point : result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
    monto,
  };
}

export async function testMpConnection(accessToken: string): Promise<{ ok: boolean; userId?: number }> {
  const data = await mpRequest<{ id: number }>(accessToken, 'GET', '/users/me');
  return { ok: true, userId: data.id };
}

interface MpPayment {
  id: number;
  status: string;
  status_detail?: string;
  transaction_amount: number;
  external_reference?: string;
}

export async function processWebhookNotification(params: {
  type?: string;
  data?: { id?: string | number };
  queryTopic?: string;
  queryId?: string;
  queryTenant?: string;
  xSignature?: string;
  xRequestId?: string;
}): Promise<void> {
  const paymentId =
    params.data?.id?.toString() ||
    (params.queryTopic === 'payment' ? params.queryId : undefined);

  if (!paymentId) return;

  const verified = verifyMpWebhookSignature({
    xSignature: params.xSignature,
    xRequestId: params.xRequestId,
    dataId: paymentId,
    secret: process.env.MP_WEBHOOK_SECRET,
  });

  if (!verified) {
    throw new AppError(401, 'INVALID_SIGNATURE', 'Firma de webhook inválida');
  }

  const tenantSlug = params.queryTenant;
  if (!tenantSlug) {
    throw new AppError(400, 'INVALID_REFERENCE', 'Tenant no especificado en webhook');
  }

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant?.db_name) {
    throw new NotFoundError('Tenant');
  }

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
      const politicas = await politicasRepo.getPoliticas();
      const accessToken = politicas?.mp_access_token || process.env.MP_TEST_ACCESS_TOKEN;
      if (!accessToken) {
        throw new AppError(400, 'MP_NOT_CONFIGURED', 'Token MP no configurado');
      }

      const payment = await mpRequest<MpPayment>(accessToken, 'GET', `/v1/payments/${paymentId}`);
      const parsed = parseMpExternalReference(payment.external_reference);
      if (!parsed || parsed.tenantSlug !== tenantSlug) {
        throw new AppError(400, 'INVALID_REFERENCE', 'external_reference inválido');
      }

      await applyPaymentResult(payment, parsed.turnoId, tenant.slug);
    }
  );
}

async function applyPaymentResult(payment: MpPayment, turnoId: number, tenantSlug: string) {
  const turno = await turnoRepo.findById(turnoId);
  if (!turno) throw new NotFoundError('Turno');

  const idempotencyKey = String(payment.id);
  const existing = await pagoRepo.findByIdempotencyKey(idempotencyKey);
  if (existing) return;

  let pagoEstado: string;
  if (payment.status === 'approved') pagoEstado = 'PAGADO';
  else if (payment.status === 'pending' || payment.status === 'in_process') pagoEstado = 'PENDIENTE';
  else pagoEstado = 'FALLIDO';

  const wasPending = turno.estado === 'PENDIENTE';

  await withTenantTransaction(async (conn) => {
    await pagoRepo.insertIfNotExists(
      {
        turnoId,
        monto: payment.transaction_amount,
        estado: pagoEstado,
        referenciaExterna: idempotencyKey,
        idempotencyKey,
      },
      conn
    );

    if (payment.status === 'approved' && wasPending) {
      await turnoRepo.updateEstado(turnoId, 'CONFIRMADO', conn);
    }
  });

  if (payment.status === 'approved' && wasPending) {
    broadcastTenantEvent(tenantSlug, 'turno.updated', {
      turnoId,
      estado: 'CONFIRMADO',
    });
    void onTurnoConfirmado(turnoId);
  }
}

/** Procesa pago simulado en tests sin llamar a MP API */
export async function processPaymentForTenant(
  tenantSlug: string,
  payment: MpPayment
): Promise<void> {
  const parsed = parseMpExternalReference(payment.external_reference);
  if (!parsed) throw new AppError(400, 'INVALID_REFERENCE', 'external_reference inválido');

  const tenant = await findTenantBySlug(tenantSlug);
  if (!tenant?.db_name) throw new NotFoundError('Tenant');

  await runWithTenantContext(
    {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantDbName: tenant.db_name,
      plan: tenant.plan,
      pageStatus: tenant.page_status,
      config: tenant.config_json ?? {},
    },
    () => applyPaymentResult(payment, parsed.turnoId, tenant.slug)
  );
}
