import { RowDataPacket } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface ProfesionalRow {
  id: number;
  nombre: string;
  especialidad: string | null;
  foto_path: string | null;
  activo: number;
  orden: number;
  servicio_ids?: number[];
}

export async function listActivos(): Promise<ProfesionalRow[]> {
  const pros = await executeTenantQuery<
    (Omit<ProfesionalRow, 'servicio_ids'> & RowDataPacket)[]
  >(
    `SELECT id, nombre, especialidad, foto_path, activo, orden
     FROM profesionales WHERE activo = 1 ORDER BY orden, nombre`
  );

  const result: ProfesionalRow[] = [];
  for (const p of pros) {
    const servicios = await executeTenantQuery<(RowDataPacket & { servicio_id: number })[]>(
      `SELECT servicio_id FROM profesional_servicios WHERE profesional_id = ?`,
      [p.id]
    );
    result.push({
      ...p,
      servicio_ids: servicios.map((s) => s.servicio_id),
    });
  }
  return result;
}

export async function findById(id: number): Promise<ProfesionalRow | null> {
  const rows = await executeTenantQuery<
    (Omit<ProfesionalRow, 'servicio_ids'> & RowDataPacket)[]
  >(`SELECT id, nombre, especialidad, foto_path, activo, orden FROM profesionales WHERE id = ? AND activo = 1`, [
    id,
  ]);
  if (!rows[0]) return null;
  const servicios = await executeTenantQuery<(RowDataPacket & { servicio_id: number })[]>(
    `SELECT servicio_id FROM profesional_servicios WHERE profesional_id = ?`,
    [id]
  );
  return { ...rows[0], servicio_ids: servicios.map((s) => s.servicio_id) };
}

export async function listActivosForServicios(servicioIds: number[]): Promise<ProfesionalRow[]> {
  const all = await listActivos();
  if (!servicioIds.length) return all;
  return all.filter((p) => {
    if (!p.servicio_ids?.length) return true;
    return servicioIds.every((sid) => p.servicio_ids!.includes(sid));
  });
}

async function attachServicioIds(
  pros: (Omit<ProfesionalRow, 'servicio_ids'> & RowDataPacket)[]
): Promise<ProfesionalRow[]> {
  const result: ProfesionalRow[] = [];
  for (const p of pros) {
    const servicios = await executeTenantQuery<(RowDataPacket & { servicio_id: number })[]>(
      `SELECT servicio_id FROM profesional_servicios WHERE profesional_id = ?`,
      [p.id]
    );
    result.push({ ...p, servicio_ids: servicios.map((s) => s.servicio_id) });
  }
  return result;
}

export async function listAll(): Promise<ProfesionalRow[]> {
  const pros = await executeTenantQuery<
    (Omit<ProfesionalRow, 'servicio_ids'> & RowDataPacket)[]
  >(`SELECT id, nombre, especialidad, foto_path, activo, orden FROM profesionales ORDER BY orden, nombre`);
  return attachServicioIds(pros);
}

export async function create(data: {
  nombre: string;
  especialidad?: string | null;
  fotoPath?: string | null;
  orden?: number;
  servicioIds?: number[];
}): Promise<number> {
  const result = await executeTenantMutation(
    `INSERT INTO profesionales (nombre, especialidad, foto_path, orden) VALUES (?, ?, ?, ?)`,
    [data.nombre, data.especialidad ?? null, data.fotoPath ?? null, data.orden ?? 0]
  );
  const id = result.insertId;
  if (data.servicioIds?.length) {
    for (const servicioId of data.servicioIds) {
      await executeTenantMutation(
        `INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES (?, ?)`,
        [id, servicioId]
      );
    }
  }
  return id;
}

export async function update(
  id: number,
  data: {
    nombre?: string;
    especialidad?: string | null;
    fotoPath?: string | null;
    orden?: number;
    activo?: number;
    servicioIds?: number[];
  }
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.especialidad !== undefined) {
    fields.push('especialidad = ?');
    params.push(data.especialidad);
  }
  if (data.fotoPath !== undefined) {
    fields.push('foto_path = ?');
    params.push(data.fotoPath);
  }
  if (data.orden !== undefined) {
    fields.push('orden = ?');
    params.push(data.orden);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    params.push(data.activo);
  }

  if (fields.length) {
    params.push(id);
    await executeTenantMutation(`UPDATE profesionales SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  if (data.servicioIds !== undefined) {
    await executeTenantMutation(`DELETE FROM profesional_servicios WHERE profesional_id = ?`, [id]);
    for (const servicioId of data.servicioIds) {
      await executeTenantMutation(
        `INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES (?, ?)`,
        [id, servicioId]
      );
    }
  }
}

export async function countActivos(): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(*) AS cnt FROM profesionales WHERE activo = 1`
  );
  return rows[0]?.cnt ?? 0;
}
