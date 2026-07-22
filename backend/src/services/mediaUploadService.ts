import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getTenantContext } from '../context/tenantContext';
import * as metaRepo from '../repositories/tenant/tenantMetaRepository';
import { AppError } from '../utils/errors';

export type MediaType = 'logo' | 'favicon' | 'hero';

const MAX_SIZE: Record<MediaType, number> = {
  logo: 2 * 1024 * 1024,
  favicon: 2 * 1024 * 1024,
  hero: 5 * 1024 * 1024,
};

const FIELD_MAP: Record<MediaType, 'logo_path' | 'favicon_path' | 'hero_path'> = {
  logo: 'logo_path',
  favicon: 'favicon_path',
  hero: 'hero_path',
};

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

function uploadsRoot(): string {
  return process.env.UPLOADS_PATH || path.join(process.cwd(), 'uploads');
}

function tenantUploadDir(tenantId: number): string {
  return path.join(uploadsRoot(), 'tenants', String(tenantId));
}

async function processImage(type: MediaType, buffer: Buffer): Promise<Buffer> {
  // sharp metadata validates real image bytes (rejects non-images)
  const img = sharp(buffer, { failOn: 'error' });
  await img.metadata();
  if (type === 'logo') {
    return img.resize(400, 400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  }
  if (type === 'favicon') {
    return img.resize(64, 64, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
  }
  return img.resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
}

export async function uploadTenantMedia(
  type: MediaType,
  file: Express.Multer.File
): Promise<{ path: string; type: MediaType }> {
  const ctx = getTenantContext();
  if (!ctx) throw new AppError(500, 'NO_CONTEXT', 'Sin contexto de tenant');

  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Formato de imagen no soportado');
  }
  if (file.size > MAX_SIZE[type]) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Archivo demasiado grande');
  }

  const dir = tenantUploadDir(ctx.tenantId);
  fs.mkdirSync(dir, { recursive: true });

  let processed: Buffer;
  try {
    processed = await processImage(type, file.buffer);
  } catch {
    throw new AppError(400, 'VALIDATION_ERROR', 'Archivo de imagen inválido');
  }

  const filename = `${type}.webp`;
  const absPath = path.join(dir, filename);
  const tmpPath = path.join(dir, `.${filename}.${process.pid}.tmp`);
  fs.writeFileSync(tmpPath, processed);
  fs.renameSync(tmpPath, absPath);

  const relPath = `tenants/${ctx.tenantId}/${filename}`;
  await metaRepo.updateEstiloPath(FIELD_MAP[type], relPath);

  return { path: relPath, type };
}

export function resolveAssetAbsolutePath(relPath: string | null): string | null {
  if (!relPath) return null;
  // Prevent path traversal
  const normalized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  if (normalized.includes('..')) return null;
  const abs = path.join(uploadsRoot(), normalized);
  if (!abs.startsWith(path.resolve(uploadsRoot()))) return null;
  return fs.existsSync(abs) ? abs : null;
}
