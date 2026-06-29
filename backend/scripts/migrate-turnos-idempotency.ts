import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { listTenants } from '../src/repositories/admin/tenantRepository';
import { closeAdminPool } from '../src/config/adminDatabase';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrateDb(connection: mysql.Connection, dbName: string): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'turnos' AND COLUMN_NAME = 'idempotency_key'`,
    [dbName]
  );
  if (cols.length > 0) {
    console.log(`  ${dbName}: ya tiene idempotency_key — skip`);
    return;
  }
  await connection.query(`USE \`${dbName}\``);
  await connection.query(
    `ALTER TABLE turnos ADD COLUMN idempotency_key VARCHAR(36) DEFAULT NULL AFTER token_gestion`
  );
  await connection.query(
    `ALTER TABLE turnos ADD UNIQUE KEY uq_idempotency_key (idempotency_key)`
  );
  console.log(`  ${dbName}: migrado OK`);
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const tenants = await listTenants({ status: 'activo' });
    for (const t of tenants) {
      if (!t.db_name) continue;
      await migrateDb(connection, t.db_name);
    }
    console.log('Migración idempotency completada.');
  } finally {
    await connection.end();
    await closeAdminPool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
