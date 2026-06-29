import * as metaRepo from '../repositories/tenant/tenantMetaRepository';
import { AppError } from '../utils/errors';

function mapMeta(row: metaRepo.TenantMetaRow) {
  return {
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    direccion: row.direccion,
    direccionLat: row.direccion_lat != null ? Number(row.direccion_lat) : null,
    direccionLng: row.direccion_lng != null ? Number(row.direccion_lng) : null,
    timezone: row.timezone,
    textoBienvenida: row.texto_bienvenida,
  };
}

function mapEstilos(row: metaRepo.TenantEstilosRow) {
  return {
    colorPrimario: row.color_primario,
    colorAcento: row.color_acento,
    logoPath: row.logo_path,
    faviconPath: row.favicon_path,
    heroPath: row.hero_path,
  };
}

export async function getTenantMetaPanel() {
  const row = await metaRepo.getTenantMeta();
  if (!row) throw new AppError(500, 'CONFIG_ERROR', 'tenant_meta no configurado');
  return mapMeta(row);
}

export async function updateTenantMetaPanel(input: {
  nombre?: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  timezone?: string;
  textoBienvenida?: string | null;
}) {
  await metaRepo.updateTenantMeta({
    nombre: input.nombre,
    email: input.email,
    telefono: input.telefono,
    direccion: input.direccion,
    timezone: input.timezone,
    textoBienvenida: input.textoBienvenida,
  });
  return getTenantMetaPanel();
}

export async function getTenantEstilosPanel() {
  const row = await metaRepo.getTenantEstilos();
  if (!row) throw new AppError(500, 'CONFIG_ERROR', 'tenant_estilos no configurado');
  return mapEstilos(row);
}

export async function updateTenantEstilosPanel(input: {
  colorPrimario?: string | null;
  colorAcento?: string | null;
}) {
  await metaRepo.updateTenantEstilos({
    colorPrimario: input.colorPrimario,
    colorAcento: input.colorAcento,
  });
  return getTenantEstilosPanel();
}
