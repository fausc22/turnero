import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let adminPool: Pool | null = null;

function getAdminPool(): Pool {
  if (!adminPool) {
    adminPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_ADMIN_NAME || 'tuturno_admin',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      charset: 'utf8mb4',
    });
  }
  return adminPool;
}

export async function executeAdminQuery<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [rows] = await getAdminPool().execute<T>(sql, params);
  return rows;
}

export async function executeAdminMutation(
  sql: string,
  params: unknown[] = []
): Promise<import('mysql2/promise').ResultSetHeader> {
  const [result] = await getAdminPool().execute(sql, params);
  return result as import('mysql2/promise').ResultSetHeader;
}

export async function getAdminConnection(): Promise<PoolConnection> {
  return getAdminPool().getConnection();
}

export async function testAdminConnection(): Promise<void> {
  const conn = await getAdminConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

export async function closeAdminPool(): Promise<void> {
  if (adminPool) {
    await adminPool.end();
    adminPool = null;
  }
}

export { getAdminPool as adminPool };
