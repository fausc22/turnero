import { db } from '../config/database';

interface CreateAuditData {
  barberia_id: number | null;
  usuario_id: number;
  accion: string;
  entidad: string;
  entidad_id: number | null;
  datos_previos: any;
  datos_nuevos: any;
}

class AuditRepository {
  async create(data: CreateAuditData): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO auditoria 
       (barberia_id, usuario_id, accion, entidad, entidad_id, datos_previos, datos_nuevos) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.barberia_id,
        data.usuario_id,
        data.accion,
        data.entidad,
        data.entidad_id,
        JSON.stringify(data.datos_previos),
        JSON.stringify(data.datos_nuevos)
      ]
    );

    return (result as any).insertId;
  }

  async findByBarberia(barberiaId: number, limit = 100): Promise<any[]> {
    const [rows] = await db.execute(
      `SELECT * FROM auditoria 
       WHERE barberia_id = ? 
       ORDER BY creado_en DESC 
       LIMIT ?`,
      [barberiaId, limit]
    );

    return rows as any[];
  }
}

export const auditRepository = new AuditRepository();

