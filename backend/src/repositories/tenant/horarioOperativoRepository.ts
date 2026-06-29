import { RowDataPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface HorarioOperativoRow {
  id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  profesional_id: number | null;
}

export async function findByDiaSemana(
  diaSemana: number,
  profesionalId?: number | null
): Promise<HorarioOperativoRow[]> {
  if (profesionalId != null) {
    return executeTenantQuery<(HorarioOperativoRow & RowDataPacket)[]>(
      `SELECT id, dia_semana, hora_inicio, hora_fin, profesional_id
       FROM horarios_operativos
       WHERE dia_semana = ? AND (profesional_id IS NULL OR profesional_id = ?)
       ORDER BY hora_inicio`,
      [diaSemana, profesionalId]
    );
  }
  return executeTenantQuery<(HorarioOperativoRow & RowDataPacket)[]>(
    `SELECT id, dia_semana, hora_inicio, hora_fin, profesional_id
     FROM horarios_operativos WHERE dia_semana = ?
     ORDER BY hora_inicio`,
    [diaSemana]
  );
}

export async function listAll(): Promise<HorarioOperativoRow[]> {
  return executeTenantQuery<(HorarioOperativoRow & RowDataPacket)[]>(
    `SELECT id, dia_semana, hora_inicio, hora_fin, profesional_id
     FROM horarios_operativos ORDER BY dia_semana, hora_inicio`
  );
}

export async function replaceDay(
  diaSemana: number,
  franjas: { horaInicio: string; horaFin: string; profesionalId?: number | null }[],
  profesionalId?: number | null,
  conn?: PoolConnection
): Promise<void> {
  const deleteSql = profesionalId != null
    ? `DELETE FROM horarios_operativos WHERE dia_semana = ? AND profesional_id = ?`
    : `DELETE FROM horarios_operativos WHERE dia_semana = ? AND profesional_id IS NULL`;
  const deleteParams =
    profesionalId != null ? [diaSemana, profesionalId] : [diaSemana];

  if (conn) {
    await conn.execute(deleteSql, deleteParams);
    for (const f of franjas) {
      await conn.execute<ResultSetHeader>(
        `INSERT INTO horarios_operativos (dia_semana, hora_inicio, hora_fin, profesional_id)
         VALUES (?, ?, ?, ?)`,
        [diaSemana, f.horaInicio, f.horaFin, f.profesionalId ?? profesionalId ?? null]
      );
    }
    return;
  }

  await executeTenantMutation(deleteSql, deleteParams);
  for (const f of franjas) {
    await executeTenantMutation(
      `INSERT INTO horarios_operativos (dia_semana, hora_inicio, hora_fin, profesional_id)
       VALUES (?, ?, ?, ?)`,
      [diaSemana, f.horaInicio, f.horaFin, f.profesionalId ?? profesionalId ?? null]
    );
  }
}

export async function deleteById(id: number): Promise<void> {
  await executeTenantMutation(`DELETE FROM horarios_operativos WHERE id = ?`, [id]);
}
