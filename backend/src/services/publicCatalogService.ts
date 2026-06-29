import * as servicioRepo from '../repositories/tenant/servicioRepository';
import * as productoRepo from '../repositories/tenant/productoRepository';
import * as profesionalRepo from '../repositories/tenant/profesionalRepository';

export async function listServicios() {
  const servicios = await servicioRepo.listActivos();
  const byCategory = new Map<string, typeof servicios>();

  for (const s of servicios) {
    const key = s.categoria_nombre ?? 'General';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(s);
  }

  return {
    categorias: Array.from(byCategory.entries()).map(([nombre, items]) => ({
      nombre,
      servicios: items.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        descripcion: s.descripcion,
        duracionMinutos: s.duracion_minutos,
        precio: Number(s.precio),
        orden: s.orden,
      })),
    })),
  };
}

export async function listProductos() {
  const productos = await productoRepo.listActivosConStock();
  return {
    productos: productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      stockActual: p.stock_actual,
      orden: p.orden,
    })),
  };
}

export async function listProfesionales() {
  const profesionales = await profesionalRepo.listActivos();
  return {
    profesionales: profesionales.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      especialidad: p.especialidad,
      fotoPath: p.foto_path,
      servicioIds: p.servicio_ids ?? [],
      orden: p.orden,
    })),
  };
}
