import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { listTenants } from '../src/repositories/admin/tenantRepository';
import { seedDefaults } from '../src/repositories/tenant/plantillaNotificacionRepository';
import { closeAdminPool } from '../src/config/adminDatabase';

dotenv.config({ path: path.join(__dirname, '../.env') });

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
      console.log(`Seeding plantillas: ${tenant.slug}`);
      await connection.query(`USE \`${tenant.db_name}\``);
      await seedDefaults(connection);
    }
    console.log('Plantillas seed OK');
  } finally {
    await connection.end();
    await closeAdminPool();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
