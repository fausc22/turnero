import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { uploadTenantMedia, resolveAssetAbsolutePath, type MediaType } from '../../services/mediaUploadService';
import * as metaRepo from '../../repositories/tenant/tenantMetaRepository';
import { AppError } from '../../utils/errors';

const VALID_TYPES = new Set<MediaType>(['logo', 'favicon', 'hero']);

function getPathForType(type: MediaType, estilos: metaRepo.TenantEstilosRow): string | null {
  if (type === 'logo') return estilos.logo_path;
  if (type === 'favicon') return estilos.favicon_path;
  return estilos.hero_path;
}

export async function upload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = req.body.type as MediaType;
    if (!VALID_TYPES.has(type)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Tipo de media inválido');
    }
    if (!req.file) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Archivo requerido');
    }
    const data = await uploadTenantMedia(type, req.file);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = req.params.type as MediaType;
    if (!VALID_TYPES.has(type)) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tipo inválido' } });
      return;
    }

    const estilos = await metaRepo.getTenantEstilos();
    if (!estilos) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sin estilos' } });
      return;
    }

    const relPath = getPathForType(type, estilos);
    const absPath = resolveAssetAbsolutePath(relPath);
    if (!absPath) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Asset no encontrado' } });
      return;
    }

    res.type(path.extname(absPath) === '.webp' ? 'image/webp' : 'image/png');
    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
}
