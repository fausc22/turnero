import { RowDataPacket, PoolConnection, Connection } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export type PlantillaTipo =
  | 'confirmacion'
  | 'recordatorio_24h'
  | 'recordatorio_2h'
  | 'cancelacion';

export type PlantillaCanal = 'whatsapp' | 'email';

export interface PlantillaRow {
  id: number;
  tipo: PlantillaTipo;
  canal: PlantillaCanal;
  cuerpo: string;
}

export async function listAll(): Promise<PlantillaRow[]> {
  return executeTenantQuery<(PlantillaRow & RowDataPacket)[]>(
    `SELECT id, tipo, canal, cuerpo FROM plantillas_notificacion ORDER BY tipo, canal`
  );
}

export async function findByTipoCanal(
  tipo: PlantillaTipo,
  canal: PlantillaCanal
): Promise<PlantillaRow | null> {
  const rows = await executeTenantQuery<(PlantillaRow & RowDataPacket)[]>(
    `SELECT id, tipo, canal, cuerpo FROM plantillas_notificacion WHERE tipo = ? AND canal = ? LIMIT 1`,
    [tipo, canal]
  );
  return rows[0] ?? null;
}

export async function upsert(
  tipo: PlantillaTipo,
  canal: PlantillaCanal,
  cuerpo: string,
  conn?: PoolConnection
): Promise<void> {
  const sql = `INSERT INTO plantillas_notificacion (tipo, canal, cuerpo) VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE cuerpo = VALUES(cuerpo)`;
  if (conn) {
    await conn.execute(sql, [tipo, canal, cuerpo]);
    return;
  }
  await executeTenantMutation(sql, [tipo, canal, cuerpo]);
}

export const DEFAULT_PLANTILLAS: { tipo: PlantillaTipo; canal: PlantillaCanal; cuerpo: string }[] = [
  {
    tipo: 'confirmacion',
    canal: 'whatsapp',
    cuerpo:
      'Hola {{clienteNombre}}! Tu turno en {{localNombre}} quedó confirmado para el {{fecha}} a las {{hora}}. Gestioná tu turno: {{linkGestion}}',
  },
  {
    tipo: 'confirmacion',
    canal: 'email',
    cuerpo: '@file:confirmacion',
  },
  {
    tipo: 'cancelacion',
    canal: 'whatsapp',
    cuerpo:
      'Hola {{clienteNombre}}, tu turno en {{localNombre}} del {{fecha}} a las {{hora}} fue cancelado.',
  },
  {
    tipo: 'cancelacion',
    canal: 'email',
    cuerpo: '@file:cancelacion',
  },
  {
    tipo: 'recordatorio_24h',
    canal: 'whatsapp',
    cuerpo:
      'Hola {{clienteNombre}}! Te recordamos tu turno mañana en {{localNombre}}: {{fecha}} a las {{hora}}. {{linkGestion}}',
  },
  {
    tipo: 'recordatorio_24h',
    canal: 'email',
    cuerpo: '@file:recordatorio',
  },
  {
    tipo: 'recordatorio_2h',
    canal: 'whatsapp',
    cuerpo:
      'Hola {{clienteNombre}}! Tu turno en {{localNombre}} es hoy a las {{hora}}. Te esperamos en {{direccion}}.',
  },
  {
    tipo: 'recordatorio_2h',
    canal: 'email',
    cuerpo: '@file:recordatorio',
  },
];

export async function seedDefaults(connection: PoolConnection | Connection): Promise<void> {
  for (const p of DEFAULT_PLANTILLAS) {
    await connection.execute(
      `INSERT IGNORE INTO plantillas_notificacion (tipo, canal, cuerpo) VALUES (?, ?, ?)`,
      [p.tipo, p.canal, p.cuerpo]
    );
  }
}
