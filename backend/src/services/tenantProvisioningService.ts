import fs from 'fs';
import path from 'path';
import mysql, { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { getAdminConnection } from '../config/adminDatabase';
import { tenantDbNameFromSlug, sanitizeDbName } from '../utils/dbName';
import { isValidSlug, normalizeSlug } from '../utils/slug';
import { parseSchemaSql } from '../utils/parseSchemaSql';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import * as tenantRepo from '../repositories/admin/tenantRepository';
import * as runRepo from '../repositories/admin/tenantProvisioningRunRepository';
import * as domainRepo from '../repositories/admin/tenantDomainRepository';
import { upsertFromTenantUser } from './tenantUserIndexService';
import { seedTenantDemoData } from './seedTenantDemoData';
import { seedDefaults as seedPlantillas } from '../repositories/tenant/plantillaNotificacionRepository';
import type { TenantPlan, TenantRow } from '../types/tenant';
import { createTenantSchema } from '../utils/validations';
import { z } from 'zod';

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

export interface GerenteInput {
  nombre: string;
  email: string;
  password: string;
}

function getRootConnectionConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: false,
    charset: 'utf8mb4' as const,
  };
}

function getSchemaPath(): string {
  return path.join(__dirname, '../../../data/schema_tenant.sql');
}

async function applySchemaToTenantDb(connection: Connection, tenantDbName: string): Promise<void> {
  const rawSchema = fs.readFileSync(getSchemaPath(), 'utf8');
  const statements = parseSchemaSql(rawSchema);
  await connection.query(`USE \`${tenantDbName}\``);
  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function createManagerUser(
  connection: Connection,
  tenantDbName: string,
  nombre: string,
  email: string,
  password: string,
  tenantNombre: string
): Promise<{ id: number; email: string }> {
  const passwordHash = await bcrypt.hash(password, 12);
  await connection.query(`USE \`${tenantDbName}\``);
  await connection.execute(`UPDATE tenant_meta SET nombre = ?, email = ? WHERE id = 1`, [
    tenantNombre,
    email,
  ]);
  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
     VALUES (?, ?, ?, 'GERENTE', 1)`,
    [nombre, email.toLowerCase(), passwordHash]
  );
  return { id: result.insertId, email: email.toLowerCase() };
}

async function dropTenantDatabase(slug: string): Promise<void> {
  const safeDbName = sanitizeDbName(tenantDbNameFromSlug(slug));
  if (!safeDbName) return;
  const rootConn = await mysql.createConnection(getRootConnectionConfig());
  try {
    await rootConn.query(`DROP DATABASE IF EXISTS \`${safeDbName}\``);
  } finally {
    await rootConn.end();
  }
}

async function runProvisioning(
  tenant: TenantRow,
  gerente: GerenteInput,
  requestedBy: number | null,
  seedDemoData: boolean
): Promise<TenantRow> {
  const slug = tenant.slug;
  const tenantDbName = tenantDbNameFromSlug(slug);
  const safeDbName = sanitizeDbName(tenantDbName);
  if (!safeDbName) {
    throw new ValidationError(`Nombre de BD inválido: ${tenantDbName}`);
  }

  const adminConn = await getAdminConnection();
  const rootConn = await mysql.createConnection(getRootConnectionConfig());
  let runId: number | null = null;

  try {
    runId = await runRepo.createProvisioningRun(tenant.id, requestedBy);

    const [dbs] = await rootConn.query<RowDataPacket[]>(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [safeDbName]
    );
    if (dbs.length > 0) {
      throw new ConflictError(`La base de datos ${safeDbName} ya existe`, 'DB_ALREADY_EXISTS');
    }

    await rootConn.query(
      `CREATE DATABASE \`${safeDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    await applySchemaToTenantDb(rootConn, safeDbName);
    await rootConn.query(`USE \`${safeDbName}\``);
    await seedPlantillas(rootConn);

    const manager = await createManagerUser(
      rootConn,
      safeDbName,
      gerente.nombre,
      gerente.email,
      gerente.password,
      tenant.nombre
    );

    if (seedDemoData) {
      await seedTenantDemoData(rootConn, safeDbName, slug);
    }

    const existingDomains = await domainRepo.listByTenant(tenant.id);
    if (!existingDomains.length) {
      const baseDomain = process.env.BASE_DOMAIN?.trim().replace(/^\*\./, '').replace(/^\.+/, '');
      const domain = baseDomain ? `${slug}.${baseDomain}` : `${slug}.localhost`;
      await domainRepo.createTenantDomain(tenant.id, domain, true);
    }

    await tenantRepo.updateTenantDbName(tenant.id, safeDbName);
    await upsertFromTenantUser({ id: tenant.id, slug }, manager);
    await runRepo.markProvisioningSuccess(runId);

    const updated = await tenantRepo.findTenantById(tenant.id);
    if (!updated) throw new Error('Tenant no encontrado tras provisioning');
    return updated;
  } catch (error) {
    try {
      await rootConn.query(`DROP DATABASE IF EXISTS \`${safeDbName}\``);
    } catch {
      // ignore cleanup errors
    }
    if (runId) {
      await runRepo.markProvisioningError(
        runId,
        error instanceof Error ? error.message : 'Error desconocido'
      );
    }
    throw error;
  } finally {
    await rootConn.end();
    adminConn.release();
  }
}

export async function provisionTenant(
  input: CreateTenantInput,
  requestedBy: number
): Promise<TenantRow> {
  const data = createTenantSchema.parse(input);
  const slug = normalizeSlug(data.slug);

  if (!isValidSlug(slug)) {
    throw new ValidationError('Slug inválido o reservado');
  }

  const existing = await tenantRepo.findTenantBySlug(slug);
  if (existing) {
    throw new ConflictError(`Ya existe un tenant con slug "${slug}"`, 'DUPLICATE_SLUG');
  }

  const tenantId = await tenantRepo.createTenant({
    slug,
    nombre: data.nombre,
    plan: data.plan as TenantPlan,
    page_status: data.page_status,
    trial_ends_at: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
  });

  const tenant = await tenantRepo.findTenantById(tenantId);
  if (!tenant) throw new Error('Error al crear tenant');

  return runProvisioning(tenant, data.gerente, requestedBy, data.seedDemoData ?? false);
}

export async function reprovisionTenant(
  tenantId: number,
  gerente: GerenteInput,
  requestedBy: number,
  seedDemoData = false
): Promise<TenantRow> {
  const tenant = await tenantRepo.findTenantById(tenantId);
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }

  await dropTenantDatabase(tenant.slug);
  await tenantRepo.updateTenantDbName(tenantId, null);

  const refreshed = await tenantRepo.findTenantById(tenantId);
  if (!refreshed) throw new NotFoundError('Tenant');

  return runProvisioning(refreshed, gerente, requestedBy, seedDemoData);
}
