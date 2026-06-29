import { NotFoundError } from '../utils/errors';
import * as tenantRepo from '../repositories/admin/tenantRepository';
import * as runRepo from '../repositories/admin/tenantProvisioningRunRepository';
import * as domainRepo from '../repositories/admin/tenantDomainRepository';
import {
  provisionTenant,
  reprovisionTenant,
  type CreateTenantInput,
} from './tenantProvisioningService';
import { logPlatformEvent } from './platformAuditService';
import { updateTenantSchema, reprovisionTenantSchema } from '../utils/validations';
import type { ListTenantsFilters } from '../repositories/admin/tenantRepository';

export class SuperTenantService {
  async list(filters: ListTenantsFilters) {
    const tenants = await tenantRepo.listTenants(filters);
    return Promise.all(
      tenants.map(async (tenant) => {
        const latestRun = await runRepo.findLatestByTenant(tenant.id);
        return { ...tenant, latestProvisioningRun: latestRun };
      })
    );
  }

  async getById(id: number) {
    const tenant = await tenantRepo.findTenantById(id);
    if (!tenant) throw new NotFoundError('Tenant');
    const runs = await runRepo.listByTenant(id);
    const domains = await domainRepo.listByTenant(id);
    return { ...tenant, provisioningRuns: runs, domains };
  }

  async create(input: CreateTenantInput, superUserId: number) {
    const tenant = await provisionTenant(input, superUserId);
    await logPlatformEvent({
      superUsuarioId: superUserId,
      action: 'TENANT_CREATED',
      entityType: 'tenant',
      entityId: tenant.id,
      payload: { slug: tenant.slug },
    });
    return tenant;
  }

  async update(id: number, body: unknown, superUserId: number) {
    const data = updateTenantSchema.parse(body);
    const existing = await tenantRepo.findTenantById(id);
    if (!existing) throw new NotFoundError('Tenant');

    await tenantRepo.updateTenant(id, {
      nombre: data.nombre,
      plan: data.plan,
      status: data.status,
      page_status: data.page_status,
      trial_ends_at:
        data.trial_ends_at === undefined
          ? undefined
          : data.trial_ends_at === null
            ? null
            : new Date(data.trial_ends_at),
    });

    if (data.status === 'suspendido') {
      await logPlatformEvent({
        superUsuarioId: superUserId,
        action: 'TENANT_SUSPENDED',
        entityType: 'tenant',
        entityId: id,
      });
    } else {
      await logPlatformEvent({
        superUsuarioId: superUserId,
        action: 'TENANT_UPDATED',
        entityType: 'tenant',
        entityId: id,
        payload: data as Record<string, unknown>,
      });
    }

    return tenantRepo.findTenantById(id);
  }

  async softDelete(id: number, superUserId: number) {
    const existing = await tenantRepo.findTenantById(id);
    if (!existing) throw new NotFoundError('Tenant');
    await tenantRepo.softDeleteTenant(id);
    await logPlatformEvent({
      superUsuarioId: superUserId,
      action: 'TENANT_UPDATED',
      entityType: 'tenant',
      entityId: id,
      payload: { status: 'eliminado' },
    });
  }

  async reprovision(id: number, body: unknown, superUserId: number) {
    const data = reprovisionTenantSchema.parse(body);
    const tenant = await reprovisionTenant(
      id,
      data.gerente,
      superUserId,
      data.seedDemoData ?? false
    );
    await logPlatformEvent({
      superUsuarioId: superUserId,
      action: 'TENANT_REPROVISIONED',
      entityType: 'tenant',
      entityId: id,
    });
    return tenant;
  }
}

export const superTenantService = new SuperTenantService();
