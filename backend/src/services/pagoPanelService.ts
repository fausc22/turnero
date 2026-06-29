import * as pagoRepo from '../repositories/tenant/pagoRepository';

export async function listPagos(filters: {
  from?: string;
  to?: string;
  estado?: string;
  limit?: number;
}) {
  const rows = await pagoRepo.list({
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
    estado: filters.estado,
    limit: filters.limit,
  });

  return rows.map((r) => ({
    id: r.id,
    turnoId: r.turno_id,
    clienteNombre: r.cliente_nombre,
    monto: Number(r.monto),
    estado: r.estado,
    proveedor: r.proveedor,
    referenciaExterna: r.referencia_externa,
    creadoEn: new Date(r.creado_en).toISOString(),
  }));
}
