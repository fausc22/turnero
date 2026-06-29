export interface SuperUsuarioRow {
  id: number;
  email: string;
  nombre: string | null;
  password_hash: string;
  rol: 'superadmin';
  activo: number;
  created_at: Date;
}

export interface SuperJwtPayload {
  sub: number;
  email: string;
  rol: 'superadmin';
  type: 'access' | 'refresh';
}

export interface TenantUserIndexRow {
  id: number;
  tenant_id: number;
  tenant_slug: string;
  email: string;
  usuario_id: number;
}

export interface ProvisioningRunRow {
  id: number;
  tenant_id: number;
  status: 'pending' | 'success' | 'error';
  error_message: string | null;
  started_at: Date | null;
  finished_at: Date | null;
  requested_by: number | null;
}

declare global {
  namespace Express {
    interface Request {
      superUser?: SuperUsuarioRow;
      tenantUser?: TenantJwtUser;
    }
  }
}

export interface TenantJwtUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  tenantId: number;
  tenantSlug: string;
  profesionalId?: number | null;
}
