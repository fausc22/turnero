import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export { testAdminConnection as testConnection } from './adminDatabase';

/** Pool legacy para rutas /api/legacy (schema monolítico turnero). */
const legacyPool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_LEGACY_NAME || 'turnero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  charset: 'utf8mb4',
});

export { legacyPool as db };
