import { RowDataPacket } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface TenantMetaRow {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  direccion_lat: number | null;
  direccion_lng: number | null;
  timezone: string;
  texto_bienvenida: string | null;
}

export interface TenantEstilosRow {
  id: number;
  logo_path: string | null;
  favicon_path: string | null;
  hero_path: string | null;
  color_primario: string | null;
  color_acento: string | null;
}

export async function getTenantMeta(): Promise<TenantMetaRow | null> {
  const rows = await executeTenantQuery<(TenantMetaRow & RowDataPacket)[]>(
    `SELECT id, nombre, email, telefono, direccion, direccion_lat, direccion_lng, timezone, texto_bienvenida
     FROM tenant_meta WHERE id = 1`
  );
  return rows[0] ?? null;
}

export async function getTenantEstilos(): Promise<TenantEstilosRow | null> {
  const rows = await executeTenantQuery<(TenantEstilosRow & RowDataPacket)[]>(
    `SELECT id, logo_path, favicon_path, hero_path, color_primario, color_acento FROM tenant_estilos WHERE id = 1`
  );
  return rows[0] ?? null;
}

export async function updateTenantMeta(data: {
  nombre?: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  direccionLat?: number | null;
  direccionLng?: number | null;
  timezone?: string;
  textoBienvenida?: string | null;
}): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    params.push(data.email);
  }
  if (data.telefono !== undefined) {
    fields.push('telefono = ?');
    params.push(data.telefono);
  }
  if (data.direccion !== undefined) {
    fields.push('direccion = ?');
    params.push(data.direccion);
  }
  if (data.direccionLat !== undefined) {
    fields.push('direccion_lat = ?');
    params.push(data.direccionLat);
  }
  if (data.direccionLng !== undefined) {
    fields.push('direccion_lng = ?');
    params.push(data.direccionLng);
  }
  if (data.timezone !== undefined) {
    fields.push('timezone = ?');
    params.push(data.timezone);
  }
  if (data.textoBienvenida !== undefined) {
    fields.push('texto_bienvenida = ?');
    params.push(data.textoBienvenida);
  }

  if (!fields.length) return;
  params.push(1);
  await executeTenantMutation(`UPDATE tenant_meta SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function updateTenantEstilos(data: {
  colorPrimario?: string | null;
  colorAcento?: string | null;
  logoPath?: string | null;
  faviconPath?: string | null;
  heroPath?: string | null;
}): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.colorPrimario !== undefined) {
    fields.push('color_primario = ?');
    params.push(data.colorPrimario);
  }
  if (data.colorAcento !== undefined) {
    fields.push('color_acento = ?');
    params.push(data.colorAcento);
  }
  if (data.logoPath !== undefined) {
    fields.push('logo_path = ?');
    params.push(data.logoPath);
  }
  if (data.faviconPath !== undefined) {
    fields.push('favicon_path = ?');
    params.push(data.faviconPath);
  }
  if (data.heroPath !== undefined) {
    fields.push('hero_path = ?');
    params.push(data.heroPath);
  }

  if (!fields.length) return;
  params.push(1);
  await executeTenantMutation(`UPDATE tenant_estilos SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function updateEstiloPath(
  field: 'logo_path' | 'favicon_path' | 'hero_path',
  path: string
): Promise<void> {
  await executeTenantMutation(`UPDATE tenant_estilos SET ${field} = ? WHERE id = 1`, [path]);
}
