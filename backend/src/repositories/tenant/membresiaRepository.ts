import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface MembresiaRow {
  id: number;
  cliente_id: number;
  puntos_acumulados: number;
}

export async function findByClienteId(clienteId: number): Promise<MembresiaRow | null> {
  const rows = await executeTenantQuery<(MembresiaRow & RowDataPacket)[]>(
    `SELECT id, cliente_id, puntos_acumulados FROM membresias WHERE cliente_id = ? LIMIT 1`,
    [clienteId]
  );
  return rows[0] ?? null;
}

export async function addPuntos(
  clienteId: number,
  puntos: number,
  conn?: PoolConnection
): Promise<void> {
  const sql = `INSERT INTO membresias (cliente_id, puntos_acumulados) VALUES (?, ?)
               ON DUPLICATE KEY UPDATE puntos_acumulados = puntos_acumulados + VALUES(puntos_acumulados)`;
  if (conn) {
    await conn.execute(sql, [clienteId, puntos]);
    return;
  }
  await executeTenantMutation(sql, [clienteId, puntos]);
}

export async function getPuntos(clienteId: number): Promise<number> {
  const row = await findByClienteId(clienteId);
  return row?.puntos_acumulados ?? 0;
}
