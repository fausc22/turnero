import * as categoriaRepo from '../repositories/tenant/categoriaServicioRepository';
import { NotFoundError } from '../utils/errors';

function mapCategoria(row: categoriaRepo.CategoriaRow) {
  return {
    id: row.id,
    nombre: row.nombre,
    orden: row.orden,
    activo: Boolean(row.activo),
  };
}

export async function listCategorias() {
  const rows = await categoriaRepo.listAll();
  return rows.map(mapCategoria);
}

export async function createCategoria(input: { nombre: string; orden?: number }) {
  const id = await categoriaRepo.create(input);
  const row = await categoriaRepo.findById(id);
  if (!row) throw new NotFoundError('Categoría');
  return mapCategoria(row);
}

export async function updateCategoria(
  id: number,
  input: { nombre?: string; orden?: number; activo?: boolean }
) {
  const existing = await categoriaRepo.findById(id);
  if (!existing) throw new NotFoundError('Categoría');
  await categoriaRepo.update(id, {
    nombre: input.nombre,
    orden: input.orden,
    activo: input.activo === undefined ? undefined : input.activo ? 1 : 0,
  });
  return mapCategoria((await categoriaRepo.findById(id))!);
}
