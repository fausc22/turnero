import { PoolConnection } from 'mysql2/promise';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as servicioRepo from '../repositories/tenant/servicioRepository';
import * as productoRepo from '../repositories/tenant/productoRepository';
import * as politicasRepo from '../repositories/tenant/politicasRepository';
import { overlaps } from '../utils/overlap';
import { AppError } from '../utils/errors';
import { generateTokenGestion } from './reservationTokenService';

export interface CreateReservaInput {
  clienteId: number;
  servicioIds: number[];
  productos?: { productoId: number; cantidad: number }[];
  profesionalId: number | null;
  fechaInicio: Date;
  fechaFin: Date;
  notas?: string | null;
  idempotencyKey?: string | null;
  estadoOverride?: string;
}

export interface CreateReservaResult {
  turnoId: number;
  tokenGestion: string;
  estado: string;
  precioTotal: number;
}

function initialEstado(modoPago: string): string {
  if (modoPago === 'SIN_PAGO' || modoPago === 'PAGO_EN_LOCAL') {
    return 'CONFIRMADO';
  }
  return 'PENDIENTE';
}

export async function createReserva(
  input: CreateReservaInput,
  conn: PoolConnection
): Promise<CreateReservaResult> {
  const politicas = await politicasRepo.getPoliticas();
  if (!politicas) {
    throw new AppError(500, 'CONFIG_ERROR', 'Políticas no configuradas');
  }

  if (input.idempotencyKey) {
    const existing = await turnoRepo.findByIdempotencyKey(input.idempotencyKey, conn);
    if (existing) {
      return {
        turnoId: existing.id,
        tokenGestion: existing.token_gestion!,
        estado: existing.estado,
        precioTotal: Number(existing.precio_total),
      };
    }
  }

  const overlapping = await turnoRepo.findOverlappingForUpdate(
    input.fechaInicio,
    input.fechaFin,
    input.profesionalId,
    conn
  );

  for (const t of overlapping) {
    if (overlaps(input.fechaInicio, input.fechaFin, new Date(t.fecha_inicio), new Date(t.fecha_fin))) {
      throw new AppError(409, 'SLOT_TAKEN', 'El horario seleccionado ya no está disponible');
    }
  }

  const servicios = await servicioRepo.findByIds(input.servicioIds, conn);
  if (servicios.length !== input.servicioIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Servicios inválidos');
  }

  let precioTotal = servicios.reduce((sum, s) => sum + Number(s.precio), 0);
  const productoLines: { productoId: number; cantidad: number; precio: number }[] = [];

  if (input.productos?.length) {
    for (const p of input.productos) {
      const prod = await productoRepo.findById(p.productoId, conn);
      if (!prod || prod.stock_actual < p.cantidad) {
        throw new AppError(409, 'STOCK_INSUFICIENTE', 'Stock insuficiente para un producto');
      }
      precioTotal += Number(prod.precio) * p.cantidad;
      productoLines.push({ productoId: p.productoId, cantidad: p.cantidad, precio: Number(prod.precio) });
    }
  }

  const estado = input.estadoOverride ?? initialEstado(politicas.modo_pago);
  const tokenGestion = generateTokenGestion();

  const turnoId = await turnoRepo.createTurno(
    {
      clienteId: input.clienteId,
      profesionalId: input.profesionalId,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      estado,
      precioTotal,
      notasCliente: input.notas,
      tokenGestion,
      idempotencyKey: input.idempotencyKey,
    },
    conn
  );

  await turnoRepo.addServicios(
    turnoId,
    servicios.map((s) => ({ servicioId: s.id, precio: Number(s.precio) })),
    conn
  );

  for (const line of productoLines) {
    await productoRepo.decrementStock(line.productoId, line.cantidad, conn);
    await turnoRepo.addProductos(
      turnoId,
      [{ productoId: line.productoId, cantidad: line.cantidad, precio: line.precio }],
      conn
    );
  }

  return { turnoId, tokenGestion, estado, precioTotal };
}
