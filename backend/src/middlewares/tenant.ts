import { Request, Response, NextFunction } from 'express';
import { runWithTenantContext } from '../context/tenantContext';
import { findTenantBySlug } from '../repositories/admin/tenantRepository';
import { normalizeSlug } from '../utils/slug';

function getSlugFromRequest(req: Request): string {
  const header = normalizeSlug(String(req.headers['x-tenant-slug'] || ''));
  if (header) return header;
  // Public assets (<img>) cannot send custom headers — allow ?slug= only for GET asset
  const path = req.originalUrl?.split('?')[0] || req.path || '';
  if (req.method === 'GET' && /\/asset(\/|$)/.test(path)) {
    return normalizeSlug(String(req.query.slug || ''));
  }
  return '';
}

export function resolveTenant(req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const slug = getSlugFromRequest(req);
      if (!slug) {
        res.status(400).json({
          error: { code: 'NO_TENANT_SLUG', message: 'Header x-tenant-slug requerido' },
        });
        return;
      }

      const tenant = await findTenantBySlug(slug);
      if (!tenant || tenant.status === 'eliminado') {
        res.status(404).json({
          error: { code: 'TENANT_NOT_FOUND', message: `Tenant "${slug}" no encontrado` },
        });
        return;
      }

      if (tenant.status === 'suspendido') {
        res.status(403).json({
          error: { code: 'TENANT_SUSPENDED', message: 'Tenant suspendido' },
        });
        return;
      }

      if (!tenant.db_name) {
        res.status(503).json({
          error: { code: 'TENANT_DB_NOT_READY', message: 'Base de datos del tenant no provisionada' },
        });
        return;
      }

      req.tenant = tenant;

      runWithTenantContext(
        {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantDbName: tenant.db_name,
          plan: tenant.plan,
          pageStatus: tenant.page_status,
          config: tenant.config_json ?? {},
        },
        () => next()
      );
    } catch (err) {
      next(err);
    }
  })();
}

export function optionalResolveTenant(req: Request, res: Response, next: NextFunction): void {
  const slug = getSlugFromRequest(req);
  if (!slug) {
    next();
    return;
  }
  resolveTenant(req, res, next);
}
