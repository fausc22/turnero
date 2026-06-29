import * as servicioRepo from '../repositories/tenant/servicioRepository';
import * as productoRepo from '../repositories/tenant/productoRepository';
import * as profesionalRepo from '../repositories/tenant/profesionalRepository';
import { AppError, NotFoundError } from '../utils/errors';
import { assertCanCreateProfesional } from './planLimitsService';

function mapServicio(row: servicioRepo.ServicioRow) {
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    categoriaNombre: row.categoria_nombre ?? null,
    nombre: row.nombre,
    descripcion: row.descripcion,
    duracionMinutos: row.duracion_minutos,
    precio: Number(row.precio),
    activo: row.activo,
    orden: row.orden,
  };
}

function mapProducto(row: productoRepo.ProductoRow) {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: Number(row.precio),
    stockActual: row.stock_actual,
    activo: row.activo,
    orden: row.orden,
  };
}

function mapProfesional(row: profesionalRepo.ProfesionalRow) {
  return {
    id: row.id,
    nombre: row.nombre,
    especialidad: row.especialidad,
    fotoPath: row.foto_path,
    activo: row.activo,
    orden: row.orden,
    servicioIds: row.servicio_ids ?? [],
  };
}

export async function listServicios() {
  const rows = await servicioRepo.listAll();
  return rows.map(mapServicio);
}

export async function createServicio(input: {
  categoriaId?: number | null;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precio: number;
  orden?: number;
}) {
  const id = await servicioRepo.create({
    categoriaId: input.categoriaId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    duracionMinutos: input.duracionMinutos,
    precio: input.precio,
    orden: input.orden,
  });
  const rows = await servicioRepo.listAll();
  const created = rows.find((r) => r.id === id);
  if (!created) throw new NotFoundError('Servicio');
  return mapServicio(created);
}

export async function updateServicio(
  id: number,
  input: {
    categoriaId?: number | null;
    nombre?: string;
    descripcion?: string;
    duracionMinutos?: number;
    precio?: number;
    orden?: number;
    activo?: number;
  }
) {
  const rows = await servicioRepo.listAll();
  if (!rows.find((r) => r.id === id)) throw new NotFoundError('Servicio');

  await servicioRepo.update(id, {
    categoriaId: input.categoriaId,
    nombre: input.nombre,
    descripcion: input.descripcion,
    duracionMinutos: input.duracionMinutos,
    precio: input.precio,
    orden: input.orden,
    activo: input.activo,
  });

  const updated = (await servicioRepo.listAll()).find((r) => r.id === id)!;
  return mapServicio(updated);
}

export async function deleteServicio(id: number) {
  const rows = await servicioRepo.listAll();
  if (!rows.find((r) => r.id === id)) throw new NotFoundError('Servicio');
  await servicioRepo.softDelete(id);
  return { id, activo: 0 };
}

export async function listProductos() {
  const rows = await productoRepo.listAll();
  return rows.map(mapProducto);
}

export async function createProducto(input: {
  nombre: string;
  precio: number;
  stockActual?: number;
  orden?: number;
}) {
  const id = await productoRepo.create(input);
  const rows = await productoRepo.listAll();
  const created = rows.find((r) => r.id === id)!;
  return mapProducto(created);
}

export async function updateProducto(
  id: number,
  input: {
    nombre?: string;
    precio?: number;
    stockActual?: number;
    orden?: number;
    activo?: number;
  }
) {
  const rows = await productoRepo.listAll();
  if (!rows.find((r) => r.id === id)) throw new NotFoundError('Producto');

  await productoRepo.update(id, {
    nombre: input.nombre,
    precio: input.precio,
    stockActual: input.stockActual,
    orden: input.orden,
    activo: input.activo,
  });

  const updated = (await productoRepo.listAll()).find((r) => r.id === id)!;
  return mapProducto(updated);
}

export async function listProfesionales() {
  const rows = await profesionalRepo.listAll();
  return rows.map(mapProfesional);
}

async function validateServicioIds(servicioIds?: number[]): Promise<void> {
  if (!servicioIds?.length) return;
  const servicios = await servicioRepo.findByIds(servicioIds);
  const activos = servicios.filter((s) => s.activo);
  if (activos.length !== servicioIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Uno o más servicios son inválidos o inactivos');
  }
}

export async function createProfesional(input: {
  nombre: string;
  especialidad?: string;
  fotoPath?: string;
  orden?: number;
  servicioIds?: number[];
}) {
  await assertCanCreateProfesional();
  await validateServicioIds(input.servicioIds);
  const id = await profesionalRepo.create({
    nombre: input.nombre,
    especialidad: input.especialidad,
    fotoPath: input.fotoPath,
    orden: input.orden,
    servicioIds: input.servicioIds,
  });
  const rows = await profesionalRepo.listAll();
  const created = rows.find((r) => r.id === id)!;
  return mapProfesional(created);
}

export async function updateProfesional(
  id: number,
  input: {
    nombre?: string;
    especialidad?: string;
    fotoPath?: string;
    orden?: number;
    activo?: number;
    servicioIds?: number[];
  }
) {
  const rows = await profesionalRepo.listAll();
  if (!rows.find((r) => r.id === id)) throw new NotFoundError('Profesional');

  if (input.servicioIds !== undefined) {
    await validateServicioIds(input.servicioIds);
  }

  await profesionalRepo.update(id, {
    nombre: input.nombre,
    especialidad: input.especialidad,
    fotoPath: input.fotoPath,
    orden: input.orden,
    activo: input.activo,
    servicioIds: input.servicioIds,
  });

  const updated = (await profesionalRepo.listAll()).find((r) => r.id === id)!;
  return mapProfesional(updated);
}
