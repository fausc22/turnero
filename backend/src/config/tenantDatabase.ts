import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';
import { requireTenantContext } from '../context/tenantContext';
import { sanitizeDbName } from '../utils/dbName';

dotenv.config();

let tenantPool: Pool | null = null;

function getTenantPool(): Pool {
  if (!tenantPool) {
    tenantPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_TENANT_POOL_LIMIT || '10', 10),
      queueLimit: 0,
      enableKeepAlive: true,
      charset: 'utf8mb4',
    });
  }
  return tenantPool;
}

async function useTenantDb(connection: PoolConnection): Promise<void> {
  const ctx = requireTenantContext();
  const safeDb = sanitizeDbName(ctx.tenantDbName);
  if (!safeDb) {
    throw new Error(`Nombre de BD de tenant inválido: ${ctx.tenantDbName}`);
  }
  await connection.query(`USE \`${safeDb}\``);
}

export async function getTenantConnection(): Promise<PoolConnection> {
  const connection = await getTenantPool().getConnection();
  await useTenantDb(connection);
  return connection;
}

export async function executeTenantQuery<T extends RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const connection = await getTenantConnection();
  try {
    const [rows] = await connection.execute<T>(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

export async function executeTenantMutation(
  sql: string,
  params: unknown[] = []
): Promise<ResultSetHeader> {
  const connection = await getTenantConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result as ResultSetHeader;
  } finally {
    connection.release();
  }
}

export async function closeTenantPool(): Promise<void> {
  if (tenantPool) {
    await tenantPool.end();
    tenantPool = null;
  }
}

export async function withTenantTransaction<T>(
  fn: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getTenantPool().getConnection();
  await useTenantDb(connection);
  await connection.beginTransaction();
  try {
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
