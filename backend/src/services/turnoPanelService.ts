import { withTenantTransaction } from '../config/tenantDatabase';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as servicioRepo from '../repositories/tenant/servicioRepository';
import * as politicasRepo from '../repositories/tenant/politicasRepository';
import * as productoRepo from '../repositories/tenant/productoRepository';
import * as clienteRepo from '../repositories/tenant/clienteRepository';
import { createReserva } from './turnoTenantService';
import { upsertByTelefono } from './clienteTenantService';
import { isSlotAvailable } from './disponibilidadService';
import { broadcastTenantEvent } from './sseBroadcast';
import { onTurnoCancelado, onTurnoConfirmado } from './turnoNotificationHooks';
import { processWaitlistForCancelledTurno } from '../jobs/processWaitlist';
import { acumularPuntos } from './membresiaService';
import { assertCanCreateTurno } from './planLimitsService';
import { getTenantContext } from '../context/tenantContext';
import { AppError, NotFoundError } from '../utils/errors';
import { addMinutes } from '../utils/timezone';
import type { TenantJwtUser } from '../types/super';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['COMPLETADO', 'CANCELADO', 'NO_ASISTIO'],
};

export interface PanelActor {
  rol: string;
  profesionalId?: number | null;
}

function resolveProfesionalFilter(
  actor: PanelActor,
  requested?: number | null
): number | null | undefined {
  if (actor.rol === 'PROFESIONAL') {
    return actor.profesionalId ?? -1;
  }
  return requested;
}

function assertProfesionalAccess(actor: PanelActor, turnoProfesionalId: number | null): void {
  if (actor.rol === 'PROFESIONAL' && turnoProfesionalId !== actor.profesionalId) {
    throw new AppError(403, 'FORBIDDEN', 'No tenés acceso a este turno');
  }
}

function mapTurnoRow(row: turnoRepo.TurnoListRow) {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre,
    clienteTelefono: row.cliente_telefono,
    profesionalId: row.profesional_id,
    profesionalNombre: row.profesional_nombre,
    fechaInicio: new Date(row.fecha_inicio).toISOString(),
    fechaFin: new Date(row.fecha_fin).toISOString(),
    estado: row.estado,
    precioTotal: Number(row.precio_total),
    notasCliente: row.notas_cliente,
    reprogramacionesCount: row.reprogramaciones_count,
    creadoEn: new Date(row.creado_en).toISOString(),
  };
}

function broadcastUpdated(turnoId: number, estado: string): void {
  const ctx = getTenantContext();
  if (!ctx) return;
  broadcastTenantEvent(ctx.tenantSlug, 'turno.updated', { turnoId, estado });
}

function broadcastCancelled(turnoId: number): void {
  const ctx = getTenantContext();
  if (!ctx) return;
  broadcastTenantEvent(ctx.tenantSlug, 'turno.cancelled', { turnoId });
}

export async function listTurnos(
  filters: {
    from?: string;
    to?: string;
    estado?: string;
    profesionalId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  },
  actor: PanelActor
) {
  const rows = await turnoRepo.list({
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
    estado: filters.estado,
    profesionalId: resolveProfesionalFilter(actor, filters.profesionalId),
    search: filters.search,
    limit: filters.limit,
    offset: filters.offset,
  });

  return rows.map(mapTurnoRow);
}

export async function getAgenda(
  filters: { from: string; to: string; profesionalId?: number },
  actor: PanelActor
) {
  const profesionalId = resolveProfesionalFilter(actor, filters.profesionalId);
  const rows = await turnoRepo.list({
    from: new Date(filters.from),
    to: new Date(filters.to),
    profesionalId,
  });

  const turnos = rows.map(mapTurnoRow);
  const byProfesional: Record<string, typeof turnos> = {};

  for (const t of turnos) {
    const key = t.profesionalId != null ? String(t.profesionalId) : 'sin-asignar';
    if (!byProfesional[key]) byProfesional[key] = [];
    byProfesional[key].push(t);
  }

  return { turnos, byProfesional };
}

export async function getTurnoDetalle(id: number, actor: PanelActor) {
  const turno = await turnoRepo.findById(id);
  if (!turno) throw new NotFoundError('Turno');

  assertProfesionalAccess(actor, turno.profesional_id);

  const [servicios, productos] = await Promise.all([
    turnoRepo.getServicios(id),
    turnoRepo.getProductos(id),
  ]);

  return {
    ...mapTurnoRow(turno),
    clienteEmail: turno.cliente_email,
    servicios: servicios.map((s) => ({
      servicioId: s.servicio_id,
      nombre: s.nombre,
      precioUnitario: Number(s.precio_unitario),
    })),
    productos: productos.map((p) => ({
      productoId: p.producto_id,
      cantidad: p.cantidad,
      precioUnitario: Number(p.precio_unitario),
    })),
  };
}

export async function createTurnoManual(
  input: {
    clienteId?: number;
    cliente?: { nombre: string; telefono: string; email?: string };
    servicioIds: number[];
    productos?: { productoId: number; cantidad: number }[];
    profesionalId?: number | null;
    fechaInicio: string;
    notas?: string;
  },
  _actor: PanelActor
) {
  await assertCanCreateTurno();
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
    let clienteId = input.clienteId;
    if (!clienteId) {
      if (!input.cliente) {
        throw new AppError(400, 'VALIDATION_ERROR', 'clienteId o cliente requerido');
      }
      clienteId = await upsertByTelefono(
        {
          nombre: input.cliente.nombre,
          telefono: input.cliente.telefono,
          email: input.cliente.email || null,
        },
        conn
      );
    } else {
      const cliente = await clienteRepo.findById(clienteId);
      if (!cliente) throw new NotFoundError('Cliente');
    }

    return createReserva(
      {
        clienteId,
        servicioIds: input.servicioIds,
        productos: input.productos,
        profesionalId,
        fechaInicio,
        fechaFin,
        notas: input.notas,
        estadoOverride: 'CONFIRMADO',
      },
      conn
    );
  });

  const detalle = await getTurnoDetalle(result.turnoId, { rol: 'GERENTE' });
  const ctx = getTenantContext();
  if (ctx) {
    broadcastTenantEvent(ctx.tenantSlug, 'turno.created', {
      turnoId: result.turnoId,
      cliente: detalle.clienteNombre,
      fechaInicio: detalle.fechaInicio,
      servicios: detalle.servicios.map((s) => s.nombre),
    });
    if (result.estado === 'CONFIRMADO') {
      void onTurnoConfirmado(result.turnoId);
    }
  }

  return {
    turnoId: result.turnoId,
    estado: result.estado,
    precioTotal: result.precioTotal,
  };
}

export async function patchEstado(id: number, estado: string, actor: PanelActor) {
  const turno = await turnoRepo.findById(id);
  if (!turno) throw new NotFoundError('Turno');

  assertProfesionalAccess(actor, turno.profesional_id);

  const allowed = ALLOWED_TRANSITIONS[turno.estado];
  if (!allowed?.includes(estado)) {
    throw new AppError(400, 'INVALID_TRANSITION', `No se puede cambiar de ${turno.estado} a ${estado}`);
  }

  await withTenantTransaction(async (conn) => {
    await turnoRepo.updateEstado(id, estado, conn);
    if (estado === 'CANCELADO') {
      const productos = await turnoRepo.getProductos(id);
      for (const p of productos) {
        await productoRepo.incrementStock(p.producto_id, p.cantidad, conn);
      }
    }
  });

  if (estado === 'CANCELADO') {
    broadcastCancelled(id);
    void onTurnoCancelado(id);
    void processWaitlistForCancelledTurno(id);
  } else {
    broadcastUpdated(id, estado);
    if (estado === 'CONFIRMADO') {
      void onTurnoConfirmado(id);
    }
    if (estado === 'COMPLETADO') {
      await acumularPuntos(turno.cliente_id, Number(turno.precio_total));
    }
  }

  return { id, estado };
}

export async function reprogramarTurno(
  id: number,
  input: { fechaInicio: string; profesionalId?: number | null },
  actor: PanelActor
) {
  const turno = await turnoRepo.findById(id);
  if (!turno) throw new NotFoundError('Turno');

  assertProfesionalAccess(actor, turno.profesional_id);

  if (!['PENDIENTE', 'CONFIRMADO'].includes(turno.estado)) {
    throw new AppError(400, 'REPROGRAM_NOT_ALLOWED', 'No se puede reprogramar este turno');
  }

  const servicios = await turnoRepo.getServicios(id);
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
      id
    );
    if (overlapping.length > 0) {
      throw new AppError(409, 'SLOT_TAKEN', 'El horario seleccionado ya no está disponible');
    }
    await turnoRepo.updateFechasPanel(
      id,
      fechaInicio,
      fechaFin,
      slotCheck.profesionalId,
      conn
    );
  });

  broadcastUpdated(id, turno.estado);

  return {
    id,
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
    profesionalId: slotCheck.profesionalId,
    reprogramacionesCount: turno.reprogramaciones_count + 1,
  };
}

export async function countTurnosByEstado(
  filters: { from?: string; to?: string },
  actor: PanelActor
) {
  return turnoRepo.countByEstado({
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
    profesionalId: resolveProfesionalFilter(actor),
  });
}

export function actorFromUser(user: TenantJwtUser): PanelActor {
  return { rol: user.rol, profesionalId: user.profesionalId };
}
