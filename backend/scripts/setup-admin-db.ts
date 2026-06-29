import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const adminDb = process.env.DB_ADMIN_NAME || 'tuturno_admin';

  const schemaPath = path.join(__dirname, '../../data/schema_admin.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    console.log(`Applying schema to ${adminDb}...`);
    await connection.query(sql);
    console.log('Admin database setup complete.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
