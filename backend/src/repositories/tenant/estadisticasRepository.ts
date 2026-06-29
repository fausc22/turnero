import { RowDataPacket } from 'mysql2/promise';
import { executeTenantQuery } from '../../config/tenantDatabase';

export async function countTurnosByEstado(
  from: Date,
  to: Date
): Promise<Record<string, number>> {
  const rows = await executeTenantQuery<(RowDataPacket & { estado: string; cnt: number })[]>(
    `SELECT estado, COUNT(*) AS cnt FROM turnos
     WHERE fecha_inicio >= ? AND fecha_inicio <= ?
     GROUP BY estado`,
    [from, to]
  );
  const result: Record<string, number> = {};
  for (const r of rows) result[r.estado] = r.cnt;
  return result;
}

export async function sumIngresos(from: Date, to: Date): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { total: number })[]>(
    `SELECT COALESCE(SUM(p.monto), 0) AS total
     FROM pagos p
     JOIN turnos t ON t.id = p.turno_id
     WHERE p.estado = 'PAGADO' AND t.fecha_inicio >= ? AND t.fecha_inicio <= ?`,
    [from, to]
  );
  return Number(rows[0]?.total ?? 0);
}

export async function countClientesNuevos(from: Date, to: Date): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(DISTINCT t.cliente_id) AS cnt
     FROM turnos t
     WHERE t.fecha_inicio >= ? AND t.fecha_inicio <= ?
       AND NOT EXISTS (
         SELECT 1 FROM turnos t2
         WHERE t2.cliente_id = t.cliente_id AND t2.fecha_inicio < ?
       )`,
    [from, to, from]
  );
  return rows[0]?.cnt ?? 0;
}

export async function countClientesRecurrentes(from: Date, to: Date): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(DISTINCT t.cliente_id) AS cnt
     FROM turnos t
     WHERE t.fecha_inicio >= ? AND t.fecha_inicio <= ?
       AND EXISTS (
         SELECT 1 FROM turnos t2
         WHERE t2.cliente_id = t.cliente_id AND t2.fecha_inicio < ?
       )`,
    [from, to, from]
  );
  return rows[0]?.cnt ?? 0;
}

export async function turnosPorDia(
  from: Date,
  to: Date
): Promise<{ fecha: string; total: number }[]> {
  return executeTenantQuery<(RowDataPacket & { fecha: string; total: number })[]>(
    `SELECT DATE(fecha_inicio) AS fecha, COUNT(*) AS total
     FROM turnos
     WHERE fecha_inicio >= ? AND fecha_inicio <= ?
     GROUP BY DATE(fecha_inicio)
     ORDER BY fecha`,
    [from, to]
  );
}

export async function serviciosTop(
  from: Date,
  to: Date,
  limit = 5
): Promise<{ servicioId: number; nombre: string; total: number }[]> {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  const rows = await executeTenantQuery<
    (RowDataPacket & { servicio_id: number; nombre: string; total: number })[]
  >(
    `SELECT ts.servicio_id, s.nombre, COUNT(*) AS total
     FROM turno_servicios ts
     JOIN turnos t ON t.id = ts.turno_id
     JOIN servicios s ON s.id = ts.servicio_id
     WHERE t.fecha_inicio >= ? AND t.fecha_inicio <= ?
     GROUP BY ts.servicio_id, s.nombre
     ORDER BY total DESC
     LIMIT ${safeLimit}`,
    [from, to]
  );
  return rows.map((r) => ({
    servicioId: r.servicio_id,
    nombre: r.nombre,
    total: r.total,
  }));
}

export async function horariosPico(
  from: Date,
  to: Date
): Promise<{ hora: number; total: number }[]> {
  const rows = await executeTenantQuery<(RowDataPacket & { hora: number; total: number })[]>(
    `SELECT HOUR(fecha_inicio) AS hora, COUNT(*) AS total
     FROM turnos
     WHERE fecha_inicio >= ? AND fecha_inicio <= ?
     GROUP BY HOUR(fecha_inicio)
     ORDER BY hora`,
    [from, to]
  );
  return rows.map((r) => ({ hora: r.hora, total: r.total }));
}

export async function ingresosPorDia(
  from: Date,
  to: Date
): Promise<{ fecha: string; total: number }[]> {
  const rows = await executeTenantQuery<(RowDataPacket & { fecha: string; total: number })[]>(
    `SELECT DATE(t.fecha_inicio) AS fecha, COALESCE(SUM(p.monto), 0) AS total
     FROM pagos p
     JOIN turnos t ON t.id = p.turno_id
     WHERE p.estado = 'PAGADO' AND t.fecha_inicio >= ? AND t.fecha_inicio <= ?
     GROUP BY DATE(t.fecha_inicio)
     ORDER BY fecha`,
    [from, to]
  );
  return rows.map((r) => ({ fecha: r.fecha, total: Number(r.total) }));
}

export async function noShowStats(
  from: Date,
  to: Date
): Promise<{ noShow: number; total: number; tasa: number }> {
  const byEstado = await countTurnosByEstado(from, to);
  const noShow = byEstado.NO_ASISTIO ?? 0;
  const total =
    (byEstado.CONFIRMADO ?? 0) + (byEstado.COMPLETADO ?? 0) + (byEstado.NO_ASISTIO ?? 0);
  const tasa = total > 0 ? Math.round((noShow / total) * 1000) / 10 : 0;
  return { noShow, total, tasa };
}
