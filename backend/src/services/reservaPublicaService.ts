import { withTenantTransaction } from '../config/tenantDatabase';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as politicasRepo from '../repositories/tenant/politicasRepository';
import * as servicioRepo from '../repositories/tenant/servicioRepository';
import * as productoRepo from '../repositories/tenant/productoRepository';
import { upsertByTelefono } from './clienteTenantService';
import { createReserva } from './turnoTenantService';
import { isSlotAvailable } from './disponibilidadService';
import { buildGestionUrl } from './reservationTokenService';
import { broadcastTenantEvent } from './sseBroadcast';
import { onTurnoCancelado, onTurnoConfirmado } from './turnoNotificationHooks';
import { processWaitlistForCancelledTurno } from '../jobs/processWaitlist';
import { getTenantContext } from '../context/tenantContext';
import { AppError, NotFoundError } from '../utils/errors';
import { addMinutes } from '../utils/timezone';

const MAX_REPROGRAMACIONES = 2;

export interface CreateReservaPublicaInput {
  servicioIds: number[];
  productos?: { productoId: number; cantidad: number }[];
  profesionalId?: number | null;
  fechaInicio: string;
  cliente: { nombre: string; telefono: string; email?: string };
  notas?: string;
  idempotencyKey?: string;
}

export async function crearReserva(input: CreateReservaPublicaInput) {
  if (input.idempotencyKey) {
    const existing = await turnoRepo.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      return formatReservaResponse(existing);
    }
  }

  const fechaInicio = new Date(input.fechaInicio);
  const servicios = await servicioRepo.findByIds(input.servicioIds);
  const politicas = await politicasRepo.getPoliticas();
  const duracion =
    servicios.reduce((s, sv) => s + sv.duracion_minutos, 0) + (politicas?.buffer_minutos ?? 0);
  const fechaFin = addMinutes(fechaInicio, duracion);

  const slotCheck = await isSlotAvailable(
    fechaInicio,
    input.servicioIds,
    input.profesionalId ?? null
  );
  if (!slotCheck.available) {
    throw new AppError(409, 'SLOT_TAKEN', 'El horario seleccionado ya no está disponible');
  }

  const profesionalId = input.profesionalId ?? slotCheck.profesionalId;

  const result = await withTenantTransaction(async (conn) => {
    const clienteId = await upsertByTelefono(
      {
        nombre: input.cliente.nombre,
        telefono: input.cliente.telefono,
        email: input.cliente.email || null,
      },
      conn
    );

    return createReserva(
      {
        clienteId,
        servicioIds: input.servicioIds,
        productos: input.productos,
        profesionalId,
        fechaInicio,
        fechaFin,
        notas: input.notas,
        idempotencyKey: input.idempotencyKey,
      },
      conn
    );
  });

  const response = {
    turnoId: result.turnoId,
    tokenGestion: result.tokenGestion,
    estado: result.estado,
    precioTotal: result.precioTotal,
    gestionarUrl: buildGestionUrl(result.tokenGestion),
  };

  const ctx = getTenantContext();
  if (ctx) {
    const [turno, serviciosTurno] = await Promise.all([
      turnoRepo.findById(result.turnoId),
      turnoRepo.getServicios(result.turnoId),
    ]);
    if (turno) {
      broadcastTenantEvent(ctx.tenantSlug, 'turno.created', {
        turnoId: result.turnoId,
        cliente: turno.cliente_nombre,
        fechaInicio: new Date(turno.fecha_inicio).toISOString(),
        servicios: serviciosTurno.map((s) => s.nombre),
      });
    }
    if (result.estado === 'CONFIRMADO') {
      void onTurnoConfirmado(result.turnoId);
    }
  }

  return response;
}

function formatReservaResponse(turno: Awaited<ReturnType<typeof turnoRepo.findByToken>>) {
  if (!turno) throw new NotFoundError('Turno');
  return {
    turnoId: turno.id,
    tokenGestion: turno.token_gestion!,
    estado: turno.estado,
    precioTotal: Number(turno.precio_total),
    gestionarUrl: buildGestionUrl(turno.token_gestion!),
  };
}

export async function getReservaByToken(token: string) {
  const turno = await turnoRepo.findByToken(token);
  if (!turno) throw new NotFoundError('Turno');

  const [servicios, politicas] = await Promise.all([
    turnoRepo.getServicios(turno.id),
    politicasRepo.getPoliticas(),
  ]);

  return {
    id: turno.id,
    estado: turno.estado,
    fechaInicio: new Date(turno.fecha_inicio).toISOString(),
    fechaFin: new Date(turno.fecha_fin).toISOString(),
    profesionalId: turno.profesional_id,
    precioTotal: Number(turno.precio_total),
    notasCliente: turno.notas_cliente,
    reprogramacionesCount: turno.reprogramaciones_count,
    servicios: servicios.map((s) => ({
      servicioId: s.servicio_id,
      nombre: s.nombre,
      precioUnitario: Number(s.precio_unitario),
    })),
    politicas: politicas
      ? {
          cancelacionHorasMinimas: politicas.cancelacion_horas_minimas,
          maxReprogramaciones: MAX_REPROGRAMACIONES,
        }
      : null,
  };
}

export async function cancelarReserva(token: string) {
  const turno = await turnoRepo.findByToken(token);
  if (!turno) throw new NotFoundError('Turno');

  if (turno.estado === 'CANCELADO') {
    return { estado: 'CANCELADO', message: 'Turno ya cancelado' };
  }

  if (!['PENDIENTE', 'CONFIRMADO'].includes(turno.estado)) {
    throw new AppError(400, 'CANCELATION_NOT_ALLOWED', 'No se puede cancelar este turno');
  }

  const politicas = await politicasRepo.getPoliticas();
  if (politicas && turno.estado === 'CONFIRMADO') {
    const horasMin = politicas.cancelacion_horas_minimas;
    const limite = new Date(turno.fecha_inicio);
    limite.setHours(limite.getHours() - horasMin);
    if (new Date() > limite) {
      throw new AppError(403, 'CANCELATION_NOT_ALLOWED', 'Fuera de la ventana de cancelación');
    }
  }

  await withTenantTransaction(async (conn) => {
    await turnoRepo.updateEstado(turno.id, 'CANCELADO', conn);
    const productos = await turnoRepo.getProductos(turno.id);
    for (const p of productos) {
      await productoRepo.incrementStock(p.producto_id, p.cantidad, conn);
    }
  });

  void onTurnoCancelado(turno.id);
  void processWaitlistForCancelledTurno(turno.id);

  return { estado: 'CANCELADO' };
}

export async function reprogramarReserva(
  token: string,
  input: { fechaInicio: string; profesionalId?: number | null }
) {
  const turno = await turnoRepo.findByToken(token);
  if (!turno) throw new NotFoundError('Turno');

  if (!['PENDIENTE', 'CONFIRMADO'].includes(turno.estado)) {
    throw new AppError(400, 'REPROGRAM_LIMIT_EXCEEDED', 'No se puede reprogramar este turno');
  }

  if (turno.reprogramaciones_count >= MAX_REPROGRAMACIONES) {
    throw new AppError(403, 'REPROGRAM_LIMIT_EXCEEDED', 'Límite de reprogramaciones alcanzado');
  }

  const servicios = await turnoRepo.getServicios(turno.id);
  const servicioIds = servicios.map((s) => s.servicio_id);
  const fechaInicio = new Date(input.fechaInicio);
  const politicas = await politicasRepo.getPoliticas();
  const servicioRows = await servicioRepo.findByIds(servicioIds);
  const duracionReal =
    servicioRows.reduce((s, sv) => s + sv.duracion_minutos, 0) + (politicas?.buffer_minutos ?? 0);
  const fechaFin = addMinutes(fechaInicio, duracionReal);

  const profesionalId = input.profesionalId ?? turno.profesional_id;
  const slotCheck = await isSlotAvailable(fechaInicio, servicioIds, profesionalId);
  if (!slotCheck.available) {
    throw new AppError(409, 'SLOT_TAKEN', 'El horario seleccionado ya no está disponible');
  }

  await withTenantTransaction(async (conn) => {
    const overlapping = await turnoRepo.findOverlappingForUpdate(
      fechaInicio,
      fechaFin,
      slotCheck.profesionalId,
      conn,
      turno.id
    );
    if (overlapping.length > 0) {
      throw new AppError(409, 'SLOT_TAKEN', 'El horario seleccionado ya no está disponible');
    }
    await turnoRepo.updateFechas(
      turno.id,
      fechaInicio,
      fechaFin,
      slotCheck.profesionalId,
      conn
    );
  });

  return {
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
    profesionalId: slotCheck.profesionalId,
    reprogramacionesCount: turno.reprogramaciones_count + 1,
  };
}
