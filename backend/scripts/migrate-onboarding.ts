import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { listTenants } from '../src/repositories/admin/tenantRepository';
import { closeAdminPool } from '../src/config/adminDatabase';

dotenv.config({ path: path.join(__dirname, '../.env') });

const SQL = `ALTER TABLE usuarios ADD COLUMN onboarding_completado TINYINT(1) NOT NULL DEFAULT 0`;

async function main() {
  const tenants = await listTenants({ status: 'activo' });
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    for (const tenant of tenants) {
      if (!tenant.db_name) continue;
      try {
        await connection.query(`USE \`${tenant.db_name}\``);
        await connection.query(SQL);
        console.log(`OK: ${tenant.slug}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Duplicate column')) {
          console.log(`Skip (ya existe): ${tenant.slug}`);
        } else {
          console.error(`FAIL ${tenant.slug}:`, msg);
        }
      }
    }
  } finally {
    await connection.end();
    await closeAdminPool();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
