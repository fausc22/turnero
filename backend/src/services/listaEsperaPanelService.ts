import * as listaEsperaRepo from '../repositories/tenant/listaEsperaRepository';
import * as servicioRepo from '../repositories/tenant/servicioRepository';
import { assertFeatureEnabled } from './planLimitsService';
import { NotFoundError } from '../utils/errors';

async function mapEntry(row: listaEsperaRepo.ListaEsperaRow) {
  const servicios = await servicioRepo.findByIds(row.servicio_ids);
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre ?? '',
    clienteTelefono: row.cliente_telefono ?? null,
    clienteEmail: row.cliente_email ?? null,
    servicioIds: row.servicio_ids,
    servicios: servicios.map((s) => ({ id: s.id, nombre: s.nombre })),
    fechaDesde: row.fecha_desde instanceof Date ? row.fecha_desde.toISOString().slice(0, 10) : String(row.fecha_desde),
    fechaHasta: row.fecha_hasta instanceof Date ? row.fecha_hasta.toISOString().slice(0, 10) : String(row.fecha_hasta),
    notificado: Boolean(row.notificado),
    creadoEn: new Date(row.creado_en).toISOString(),
  };
}

export async function listListaEspera() {
  assertFeatureEnabled('lista_espera');
  const rows = await listaEsperaRepo.listAll();
  return Promise.all(rows.map(mapEntry));
}

export async function removeListaEspera(id: number) {
  assertFeatureEnabled('lista_espera');
  const row = await listaEsperaRepo.findById(id);
  if (!row) throw new NotFoundError('Lista de espera');
  await listaEsperaRepo.remove(id);
  return { id };
}
