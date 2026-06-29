import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';
import type { PlantillaCanal } from './plantillaNotificacionRepository';

export async function wasSent(
  turnoId: number,
  tipo: string,
  canal?: PlantillaCanal
): Promise<boolean> {
  let sql = `SELECT id FROM notificaciones_enviadas WHERE turno_id = ? AND tipo = ?`;
  const params: unknown[] = [turnoId, tipo];
  if (canal) {
    sql += ` AND canal = ?`;
    params.push(canal);
  }
  sql += ` LIMIT 1`;
  const rows = await executeTenantQuery<(RowDataPacket & { id: number })[]>(sql, params);
  return rows.length > 0;
}

export async function record(
  turnoId: number,
  tipo: string,
  canal: PlantillaCanal,
  conn?: PoolConnection
): Promise<void> {
  const sql = `INSERT INTO notificaciones_enviadas (turno_id, tipo, canal) VALUES (?, ?, ?)`;
  if (conn) {
    await conn.execute(sql, [turnoId, tipo, canal]);
    return;
  }
  await executeTenantMutation(sql, [turnoId, tipo, canal]);
}
