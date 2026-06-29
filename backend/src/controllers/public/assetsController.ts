import path from 'path';
import { Request, Response, NextFunction } from 'express';
import * as metaRepo from '../../repositories/tenant/tenantMetaRepository';
import { resolveAssetAbsolutePath } from '../../services/mediaUploadService';

const VALID_TYPES = new Set(['logo', 'hero', 'favicon']);

export async function getAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = req.params.type;
    if (!VALID_TYPES.has(type)) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Tipo de asset no válido' },
      });
      return;
    }

    const estilos = await metaRepo.getTenantEstilos();
    if (!estilos) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sin estilos' } });
      return;
    }

    let relPath: string | null = null;
    if (type === 'logo') relPath = estilos.logo_path;
    else if (type === 'favicon') relPath = estilos.favicon_path;
    else relPath = estilos.hero_path;

    const absPath = resolveAssetAbsolutePath(relPath);
    if (!absPath) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Asset no encontrado' },
      });
      return;
    }

    const ext = path.extname(absPath).toLowerCase();
    if (ext === '.webp') res.type('image/webp');
    else if (ext === '.png') res.type('image/png');
    else if (ext === '.jpg' || ext === '.jpeg') res.type('image/jpeg');

    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
}
