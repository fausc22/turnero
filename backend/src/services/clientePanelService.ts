import * as clienteRepo from '../repositories/tenant/clienteRepository';
import * as membresiaRepo from '../repositories/tenant/membresiaRepository';
import { normalizePhone } from '../utils/phone';
import { AppError, NotFoundError } from '../utils/errors';

function parseTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String);
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapCliente(row: clienteRepo.ClienteFullRow) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    telefonoNormalizado: row.telefono_normalizado,
    notasInternas: row.notas_internas,
    tags: parseTags(row.tags),
    creadoEn: new Date(row.creado_en).toISOString(),
  };
}

export async function listClientes(filters: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const rows = await clienteRepo.list(filters);
  return rows.map(mapCliente);
}

export async function getCliente(id: number) {
  const row = await clienteRepo.findById(id);
  if (!row) throw new NotFoundError('Cliente');
  const [puntos, resumen] = await Promise.all([
    membresiaRepo.getPuntos(id),
    clienteRepo.getClienteResumen(id),
  ]);
  return {
    ...mapCliente(row),
    puntosMembresia: puntos,
    totalGastado: resumen.totalGastado,
    ultimaVisita: resumen.ultimaVisita,
  };
}

export async function createCliente(input: {
  nombre: string;
  telefono?: string;
  email?: string;
  notasInternas?: string;
  tags?: string[];
}) {
  let telefonoNormalizado: string | null = null;
  if (input.telefono) {
    telefonoNormalizado = normalizePhone(input.telefono);
    if (!telefonoNormalizado) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Teléfono inválido');
    }
  }

  const id = await clienteRepo.create({
    nombre: input.nombre,
    telefono: input.telefono ?? null,
    telefonoNormalizado,
    email: input.email || null,
    notasInternas: input.notasInternas ?? null,
    tags: input.tags,
  });

  return getCliente(id);
}

export async function updateCliente(
  id: number,
  input: {
    nombre?: string;
    telefono?: string;
    email?: string;
    notasInternas?: string;
    tags?: string[];
  }
) {
  const existing = await clienteRepo.findById(id);
  if (!existing) throw new NotFoundError('Cliente');

  let telefonoNormalizado: string | null | undefined;
  if (input.telefono !== undefined) {
    if (input.telefono) {
      telefonoNormalizado = normalizePhone(input.telefono);
      if (!telefonoNormalizado) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Teléfono inválido');
      }
    } else {
      telefonoNormalizado = null;
    }
  }

  await clienteRepo.update(id, {
    nombre: input.nombre,
    telefono: input.telefono,
    telefonoNormalizado,
    email: input.email,
    notasInternas: input.notasInternas,
    tags: input.tags,
  });

  return getCliente(id);
}

export async function getClienteHistorial(id: number) {
  const cliente = await clienteRepo.findById(id);
  if (!cliente) throw new NotFoundError('Cliente');

  const historial = await clienteRepo.getHistorialTurnos(id);
  return historial.map((h) => ({
    id: h.id,
    fechaInicio: new Date(h.fecha_inicio).toISOString(),
    fechaFin: new Date(h.fecha_fin).toISOString(),
    estado: h.estado,
    precioTotal: Number(h.precio_total),
    profesionalNombre: h.profesional_nombre,
    servicios: h.servicios,
  }));
}
