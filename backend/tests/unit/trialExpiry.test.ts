import { processTrialExpiry } from '../../src/jobs/trialExpiryCron';

jest.mock('../../src/repositories/admin/tenantRepository', () => ({
  listTenants: jest.fn().mockResolvedValue([
    {
      id: 99,
      slug: 'trial-expired',
      plan: 'trial',
      status: 'activo',
      page_status: 'ACTIVA',
      trial_ends_at: new Date('2020-01-01'),
    },
  ]),
  updateTenant: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/platformAuditService', () => ({
  logPlatformEvent: jest.fn().mockResolvedValue(undefined),
}));

describe('trialExpiryCron', () => {
  it('pausa tenants trial vencidos', async () => {
    const { updateTenant } = await import('../../src/repositories/admin/tenantRepository');
    await processTrialExpiry();
    expect(updateTenant).toHaveBeenCalledWith(99, { page_status: 'PAUSADA' });
  });
});
