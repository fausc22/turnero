export interface TenantConfigJson {
  timezone?: string;
  color_primario?: string;
  whatsapp_habilitado?: boolean;
  features?: Record<string, unknown>;
}

export type TenantPlan = 'trial' | 'basico' | 'profesional' | 'enterprise';
export type TenantStatus = 'activo' | 'suspendido' | 'eliminado';
export type PageStatus = 'ACTIVA' | 'PAUSADA' | 'MANTENIMIENTO' | 'BLOQUEADA';

export interface TenantRow {
  id: number;
  slug: string;
  nombre: string;
  db_name: string | null;
  plan: TenantPlan;
  status: TenantStatus;
  page_status: PageStatus;
  trial_ends_at: Date | null;
  config_json: TenantConfigJson | null;
  created_at: Date;
  updated_at: Date;
}

export interface TenantContext {
  tenantId: number;
  tenantSlug: string;
  tenantDbName: string;
  plan: TenantPlan;
  pageStatus: PageStatus;
  config: TenantConfigJson;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantRow;
    }
  }
}
