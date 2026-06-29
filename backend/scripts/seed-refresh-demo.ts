import path from 'path';
import dotenv from 'dotenv';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { findTenantBySlug } from '../src/repositories/admin/tenantRepository';
import { closeAdminPool } from '../src/config/adminDatabase';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const tenant = await findTenantBySlug('peluqueria-naz');
    if (!tenant?.db_name) {
      console.error('Tenant peluqueria-naz no provisionado');
      process.exit(1);
    }

    await connection.query(`USE \`${tenant.db_name}\``);
    const [horarioRows] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS cnt FROM horarios_operativos`
    );
    if ((horarioRows[0]?.cnt as number) > 0) {
      console.log('Demo data ya presente — skip');
      return;
    }

    const [pros] = await connection.query<RowDataPacket[]>(
      `SELECT id, nombre FROM profesionales ORDER BY orden`
    );
    const [servs] = await connection.query<RowDataPacket[]>(
      `SELECT id, nombre FROM servicios ORDER BY orden`
    );

    if (!pros.length || !servs.length) {
      console.error('Faltan profesionales/servicios base. Reprovisionar tenant.');
      process.exit(1);
    }

    const juan = pros.find((p) => p.nombre === 'Juan') ?? pros[0];
    const martin = pros.find((p) => p.nombre === 'Martín') ?? pros[1] ?? pros[0];
    const corte = servs.find((s) => s.nombre === 'Corte') ?? servs[0];
    const barba = servs.find((s) => s.nombre === 'Barba');
    const corteBarba = servs.find((s) => s.nombre === 'Corte + Barba');

    for (const s of [corte, barba, corteBarba].filter(Boolean)) {
      await connection.execute(
        `INSERT IGNORE INTO profesional_servicios (profesional_id, servicio_id) VALUES (?, ?)`,
        [juan.id, s!.id]
      );
    }
    await connection.execute(
      `INSERT IGNORE INTO profesional_servicios (profesional_id, servicio_id) VALUES (?, ?)`,
      [martin.id, corte.id]
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

      const [turnoResult] = await connection.execute(
        `INSERT INTO turnos (cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total, token_gestion)
         VALUES (?, ?, ?, ?, 'CONFIRMADO', 8000, UUID())`,
        [clienteId, juan.id, fecha, fechaFin]
      );
      const turnoId = (turnoResult as { insertId: number }).insertId;
      await connection.execute(
        `INSERT INTO turno_servicios (turno_id, servicio_id, precio_unitario) VALUES (?, ?, 8000)`,
        [turnoId, corte.id]
      );
    }

    const mpToken = process.env.MP_TEST_ACCESS_TOKEN;
    if (mpToken) {
      await connection.execute(
        `UPDATE politicas_reserva SET modo_pago = 'SEÑA_PORCENTAJE', seña_porcentaje = 50, mp_access_token = ? WHERE id = 1`,
        [mpToken]
      );
      console.log('Políticas MP demo configuradas (SEÑA 50%)');
    }

    console.log('Demo data refrescado para peluqueria-naz');
  } finally {
    await connection.end();
    await closeAdminPool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
