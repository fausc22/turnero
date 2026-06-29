import { withTenantTransaction } from '../config/tenantDatabase';
import * as listaEsperaRepo from '../repositories/tenant/listaEsperaRepository';
import * as servicioRepo from '../repositories/tenant/servicioRepository';
import { upsertByTelefono } from './clienteTenantService';
import { AppError } from '../utils/errors';
import { getTenantContext } from '../context/tenantContext';

export interface CreateListaEsperaInput {
  servicioIds: number[];
  fechaDesde: string;
  fechaHasta: string;
  cliente: { nombre: string; telefono: string; email?: string };
}

export async function crearListaEspera(input: CreateListaEsperaInput) {
  const ctx = getTenantContext();
  const features = ctx?.config?.features as Record<string, unknown> | undefined;
  if (!features?.lista_espera) {
    throw new AppError(403, 'FEATURE_DISABLED', 'Lista de espera no disponible en este plan');
  }

  if (input.fechaDesde > input.fechaHasta) {
    throw new AppError(400, 'VALIDATION_ERROR', 'fechaDesde debe ser anterior a fechaHasta');
  }

  const servicios = await servicioRepo.findByIds(input.servicioIds);
  if (servicios.length !== input.servicioIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Servicios inválidos');
  }

  const id = await withTenantTransaction(async (conn) => {
    const clienteId = await upsertByTelefono(
      {
        nombre: input.cliente.nombre,
        telefono: input.cliente.telefono,
        email: input.cliente.email || null,
      },
      conn
    );

    const dup = await listaEsperaRepo.findDuplicate(
      clienteId,
      input.servicioIds,
      input.fechaDesde,
      input.fechaHasta
    );
    if (dup) {
      throw new AppError(409, 'LISTA_ESPERA_DUPLICATE', 'Ya estás en la lista de espera para ese período');
    }

    return listaEsperaRepo.create(
      {
        clienteId,
        servicioIds: input.servicioIds,
        fechaDesde: input.fechaDesde,
        fechaHasta: input.fechaHasta,
      },
      conn
    );
  });

  return { id, message: 'Te avisaremos cuando haya un turno disponible' };
}
