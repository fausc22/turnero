import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mysql, { Connection, RowDataPacket } from 'mysql2/promise';
import { parseSchemaSql } from '../utils/parseSchemaSql';
import { listTenants } from '../repositories/admin/tenantRepository';
import { sanitizeDbName } from '../utils/dbName';

export type MigrationScope = 'admin' | 'tenant';

export interface MigrationFile {
  scope: MigrationScope;
  version: string;
  filename: string;
  absolutePath: string;
  checksum: string;
  sql: string;
}

export interface MigrationPlanItem {
  scope: MigrationScope;
  tenantSlug: string | null;
  dbName: string;
  version: string;
  checksum: string;
  status: 'pending' | 'applied' | 'checksum_mismatch';
}

export interface MigrateOptions {
  dryRun?: boolean;
  tenantSlug?: string;
  scope?: MigrationScope | 'all';
}

function migrationsRoot(): string {
  return path.join(__dirname, '../../../data/migrations');
}

function getDbConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };
}

export function loadMigrationFiles(scope: MigrationScope): MigrationFile[] {
  const dir = path.join(migrationsRoot(), scope);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((filename) => {
      const absolutePath = path.join(dir, filename);
      const sql = fs.readFileSync(absolutePath, 'utf8');
      const version = filename.replace(/\.sql$/, '');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      return { scope, version, filename, absolutePath, checksum, sql };
    });
}

async function ensureMigrationsTable(conn: Connection, adminDb: string): Promise<void> {
  await conn.query(`USE \`${adminDb}\``);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      scope ENUM('admin','tenant') NOT NULL,
      tenant_slug VARCHAR(100) NOT NULL DEFAULT '',
      version VARCHAR(100) NOT NULL,
      checksum CHAR(64) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_scope_tenant_version (scope, tenant_slug, version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function slugKey(tenantSlug: string | null): string {
  return tenantSlug ?? '';
}

async function getApplied(
  conn: Connection,
  adminDb: string,
  scope: MigrationScope,
  tenantSlug: string | null
): Promise<Map<string, string>> {
  await conn.query(`USE \`${adminDb}\``);
  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT version, checksum FROM schema_migrations
     WHERE scope = ? AND tenant_slug = ?`,
    [scope, slugKey(tenantSlug)]
  );
  const map = new Map<string, string>();
  for (const row of rows) {
    map.set(String(row.version), String(row.checksum));
  }
  return map;
}

async function recordApplied(
  conn: Connection,
  adminDb: string,
  scope: MigrationScope,
  tenantSlug: string | null,
  version: string,
  checksum: string
): Promise<void> {
  await conn.query(`USE \`${adminDb}\``);
  await conn.execute(
    `INSERT INTO schema_migrations (scope, tenant_slug, version, checksum)
     VALUES (?, ?, ?, ?)`,
    [scope, slugKey(tenantSlug), version, checksum]
  );
}

async function applySql(conn: Connection, dbName: string, sql: string): Promise<void> {
  await conn.query(`USE \`${dbName}\``);
  const statements = parseSchemaSql(sql);
  for (const statement of statements) {
    await conn.query(statement);
  }
}

export async function buildMigrationPlan(options: MigrateOptions = {}): Promise<MigrationPlanItem[]> {
  const adminDb = process.env.DB_ADMIN_NAME || 'tuturno_admin';
  const scopeFilter = options.scope || 'all';
  const plan: MigrationPlanItem[] = [];

  const conn = await mysql.createConnection({ ...getDbConfig(), multipleStatements: true });
  try {
    await ensureMigrationsTable(conn, adminDb);

    if (scopeFilter === 'all' || scopeFilter === 'admin') {
      const files = loadMigrationFiles('admin');
      const applied = await getApplied(conn, adminDb, 'admin', null);
      for (const file of files) {
        const prev = applied.get(file.version);
        let status: MigrationPlanItem['status'] = 'pending';
        if (prev === file.checksum) status = 'applied';
        else if (prev && prev !== file.checksum) status = 'checksum_mismatch';
        plan.push({
          scope: 'admin',
          tenantSlug: null,
          dbName: adminDb,
          version: file.version,
          checksum: file.checksum,
          status,
        });
      }
    }

    if (scopeFilter === 'all' || scopeFilter === 'tenant') {
      const files = loadMigrationFiles('tenant');
      const tenants = await listTenants({ status: 'activo' });
      for (const tenant of tenants) {
        if (!tenant.db_name) continue;
        if (options.tenantSlug && tenant.slug !== options.tenantSlug) continue;
        const safe = sanitizeDbName(tenant.db_name);
        if (!safe) continue;
        const applied = await getApplied(conn, adminDb, 'tenant', tenant.slug);
        for (const file of files) {
          const prev = applied.get(file.version);
          let status: MigrationPlanItem['status'] = 'pending';
          if (prev === file.checksum) status = 'applied';
          else if (prev && prev !== file.checksum) status = 'checksum_mismatch';
          plan.push({
            scope: 'tenant',
            tenantSlug: tenant.slug,
            dbName: safe,
            version: file.version,
            checksum: file.checksum,
            status,
          });
        }
      }
    }
  } finally {
    await conn.end();
  }

  return plan;
}

export async function applyMigrations(options: MigrateOptions = {}): Promise<{
  applied: MigrationPlanItem[];
  skipped: MigrationPlanItem[];
  errors: { item: MigrationPlanItem; error: string }[];
}> {
  const adminDb = process.env.DB_ADMIN_NAME || 'tuturno_admin';
  const plan = await buildMigrationPlan(options);
  const applied: MigrationPlanItem[] = [];
  const skipped: MigrationPlanItem[] = [];
  const errors: { item: MigrationPlanItem; error: string }[] = [];

  const mismatches = plan.filter((p) => p.status === 'checksum_mismatch');
  if (mismatches.length) {
    throw new Error(
      `Checksum mismatch — aborting. Fix or restore before migrate: ${mismatches
        .map((m) => `${m.scope}:${m.tenantSlug || 'admin'}:${m.version}`)
        .join(', ')}`
    );
  }

  if (options.dryRun) {
    return {
      applied: [],
      skipped: plan.filter((p) => p.status === 'applied'),
      errors: [],
    };
  }

  const adminFiles = new Map(loadMigrationFiles('admin').map((f) => [f.version, f]));
  const tenantFiles = new Map(loadMigrationFiles('tenant').map((f) => [f.version, f]));

  const conn = await mysql.createConnection({ ...getDbConfig(), multipleStatements: true });
  try {
    await ensureMigrationsTable(conn, adminDb);
    // Global advisory lock
    const [lockRows] = await conn.query<RowDataPacket[]>(
      `SELECT GET_LOCK('tuturno-migrate', 30) AS acquired`
    );
    if (!lockRows[0]?.acquired) {
      throw new Error('Could not acquire migration lock (another migrate running?)');
    }

    try {
      for (const item of plan) {
        if (item.status === 'applied') {
          skipped.push(item);
          continue;
        }
        const file =
          item.scope === 'admin' ? adminFiles.get(item.version) : tenantFiles.get(item.version);
        if (!file) {
          errors.push({ item, error: 'Migration file missing' });
          break;
        }
        try {
          await applySql(conn, item.dbName, file.sql);
          await recordApplied(
            conn,
            adminDb,
            item.scope,
            item.tenantSlug,
            item.version,
            item.checksum
          );
          applied.push({ ...item, status: 'applied' });
        } catch (err) {
          errors.push({
            item,
            error: err instanceof Error ? err.message : String(err),
          });
          break; // stop on first failure
        }
      }
    } finally {
      await conn.query(`SELECT RELEASE_LOCK('tuturno-migrate')`);
    }
  } finally {
    await conn.end();
  }

  return { applied, skipped, errors };
}

/** Mark all tenant migrations applied for a freshly provisioned DB (schema already current). */
export async function markTenantMigrationsApplied(
  tenantSlug: string,
  connection?: Connection
): Promise<void> {
  const adminDb = process.env.DB_ADMIN_NAME || 'tuturno_admin';
  const files = loadMigrationFiles('tenant');
  const owns = !connection;
  const conn = connection || (await mysql.createConnection({ ...getDbConfig(), multipleStatements: true }));
  try {
    await ensureMigrationsTable(conn, adminDb);
    for (const file of files) {
      await conn.execute(
        `INSERT IGNORE INTO \`${adminDb}\`.schema_migrations (scope, tenant_slug, version, checksum)
         VALUES ('tenant', ?, ?, ?)`,
        [tenantSlug, file.version, file.checksum]
      );
    }
  } finally {
    if (owns) await conn.end();
  }
}
