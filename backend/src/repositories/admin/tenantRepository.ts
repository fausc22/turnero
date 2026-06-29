import { RowDataPacket } from 'mysql2/promise';
import { executeAdminQuery, executeAdminMutation } from '../../config/adminDatabase';
import type { PageStatus, TenantPlan, TenantRow, TenantStatus } from '../../types/tenant';

function parseTenantRow(row: TenantRow & RowDataPacket): TenantRow {
  if (row.config_json && typeof row.config_json === 'string') {
    row.config_json = JSON.parse(row.config_json as unknown as string);
  }
  return row;
}

const SELECT_FIELDS = `id, slug, nombre, db_name, plan, status, page_status, trial_ends_at, config_json, created_at, updated_at`;

export async function findTenantBySlug(slug: string): Promise<TenantRow | null> {
  const rows = await executeAdminQuery<(TenantRow & RowDataPacket)[]>(
    `SELECT ${SELECT_FIELDS} FROM tenants WHERE slug = ? LIMIT 1`,
    [slug]
  );
  return rows[0] ? parseTenantRow(rows[0]) : null;
}

export async function findTenantById(id: number): Promise<TenantRow | null> {
  const rows = await executeAdminQuery<(TenantRow & RowDataPacket)[]>(
    `SELECT ${SELECT_FIELDS} FROM tenants WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ? parseTenantRow(rows[0]) : null;
}

export interface ListTenantsFilters {
  status?: TenantStatus;
  plan?: TenantPlan;
  search?: string;
}

export async function listTenants(filters: ListTenantsFilters = {}): Promise<TenantRow[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.plan) {
    conditions.push('plan = ?');
    params.push(filters.plan);
  }
  if (filters.search) {
    conditions.push('(slug LIKE ? OR nombre LIKE ?)');
    const q = `%${filters.search}%`;
    params.push(q, q);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await executeAdminQuery<(TenantRow & RowDataPacket)[]>(
    `SELECT ${SELECT_FIELDS} FROM tenants ${where} ORDER BY created_at DESC`,
    params
  );
  return rows.map(parseTenantRow);
}

export interface CreateTenantData {
  slug: string;
  nombre: string;
  plan: TenantPlan;
  page_status?: PageStatus;
  trial_ends_at?: Date | null;
  config_json?: Record<string, unknown> | null;
}

export async function createTenant(data: CreateTenantData): Promise<number> {
  const result = await executeAdminMutation(
    `INSERT INTO tenants (slug, nombre, db_name, plan, status, page_status, trial_ends_at, config_json)
     VALUES (?, ?, NULL, ?, 'activo', ?, ?, ?)`,
    [
      data.slug,
      data.nombre,
      data.plan,
      data.page_status ?? 'ACTIVA',
      data.trial_ends_at ?? null,
      data.config_json ? JSON.stringify(data.config_json) : null,
    ]
  );
  return result.insertId;
}

export async function updateTenantDbName(id: number, dbName: string | null): Promise<void> {
  await executeAdminQuery(
    `UPDATE tenants SET db_name = ?, updated_at = NOW() WHERE id = ?`,
    [dbName, id]
  );
}

export interface UpdateTenantData {
  nombre?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  page_status?: PageStatus;
  trial_ends_at?: Date | null;
  config_json?: Record<string, unknown> | null;
}

export async function updateTenant(id: number, data: UpdateTenantData): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.plan !== undefined) {
    fields.push('plan = ?');
    params.push(data.plan);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    params.push(data.status);
  }
  if (data.page_status !== undefined) {
    fields.push('page_status = ?');
    params.push(data.page_status);
  }
  if (data.trial_ends_at !== undefined) {
    fields.push('trial_ends_at = ?');
    params.push(data.trial_ends_at);
  }
  if (data.config_json !== undefined) {
    fields.push('config_json = ?');
    params.push(data.config_json ? JSON.stringify(data.config_json) : null);
  }

  if (!fields.length) return;

  fields.push('updated_at = NOW()');
  params.push(id);
  await executeAdminQuery(`UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function softDeleteTenant(id: number): Promise<void> {
  await executeAdminQuery(
    `UPDATE tenants SET status = 'eliminado', updated_at = NOW() WHERE id = ?`,
    [id]
  );
}
