import { Connection, RowDataPacket } from 'mysql2/promise';
import { sanitizeDbName } from '../utils/dbName';
import { seedDefaults as seedPlantillas } from '../repositories/tenant/plantillaNotificacionRepository';

async function getInsertId(connection: Connection): Promise<number> {
  const [rows] = await connection.query<RowDataPacket[]>('SELECT LAST_INSERT_ID() AS id');
  return rows[0].id as number;
}

export async function seedTenantDemoData(
  connection: Connection,
  tenantDbName: string,
  slug: string
): Promise<void> {
  const safeDb = sanitizeDbName(tenantDbName);
  if (!safeDb) return;

  await connection.query(`USE \`${safeDb}\``);
  await seedPlantillas(connection);

  if (slug === 'peluqueria-naz') {
    await connection.execute(
      `INSERT INTO profesionales (nombre, especialidad, activo, orden) VALUES
       ('Juan', 'Barbas', 1, 1),
       ('Martín', 'Color', 1, 2)`
    );
    const juanId = await getInsertId(connection);
    const martinId = juanId + 1;

    await connection.execute(
      `INSERT INTO servicios (nombre, duracion_minutos, precio, activo, orden) VALUES
       ('Corte', 30, 8000, 1, 1),
       ('Barba', 20, 5000, 1, 2),
       ('Corte + Barba', 45, 12000, 1, 3)`
    );
    const corteId = await getInsertId(connection);
    const barbaId = corteId + 1;
    const corteBarbaId = corteId + 2;

    await connection.execute(
      `INSERT INTO profesional_servicios (profesional_id, servicio_id) VALUES
       (?, ?), (?, ?), (?, ?), (?, ?)`,
      [juanId, corteId, juanId, barbaId, juanId, corteBarbaId, martinId, corteId]
    );

    for (let dia = 1; dia <= 6; dia++) {
      await connection.execute(
        `INSERT INTO horarios_operativos (dia_semana, hora_inicio, hora_fin, profesional_id)
         VALUES (?, '09:00:00', '19:00:00', NULL)`,
        [dia]
      );
    }

    await connection.execute(
      `INSERT INTO productos (nombre, precio, stock_actual, activo, orden) VALUES
       ('Cera capilar', 3500, 10, 1, 1),
       ('Shampoo premium', 4500, 5, 1, 2)`
    );

    const [clienteResult] = await connection.execute(
      `INSERT INTO clientes (nombre, email, telefono, telefono_normalizado) VALUES
       ('Cliente Demo', 'demo@example.com', '1123456789', '+541123456789')`
    );
    const clienteId = (clienteResult as { insertId: number }).insertId;

    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const fecha = new Date(now);
      fecha.setDate(fecha.getDate() + i * 2);
      fecha.setHours(10 + i, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setMinutes(fechaFin.getMinutes() + 30);

      await connection.execute(
        `INSERT INTO turnos (cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total, token_gestion)
         VALUES (?, ?, ?, ?, 'CONFIRMADO', 8000, UUID())`,
        [clienteId, juanId, fecha, fechaFin]
      );
      const turnoId = await getInsertId(connection);
      await connection.execute(
        `INSERT INTO turno_servicios (turno_id, servicio_id, precio_unitario) VALUES (?, ?, 8000)`,
        [turnoId, corteId]
      );
    }
  } else if (slug === 'estetica-luna') {
    await connection.execute(
      `INSERT INTO servicios (nombre, duracion_minutos, precio, activo, orden) VALUES
       ('Manicura', 45, 6000, 1, 1),
       ('Pedicura', 50, 7000, 1, 2),
       ('Depilación', 30, 5000, 1, 3)`
    );
    for (let dia = 1; dia <= 5; dia++) {
      await connection.execute(
        `INSERT INTO horarios_operativos (dia_semana, hora_inicio, hora_fin, profesional_id)
         VALUES (?, '10:00:00', '18:00:00', NULL)`,
        [dia]
      );
    }
  }
}
