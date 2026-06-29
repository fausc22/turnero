import { assertCanCreateTurno, getMaxTurnosMes } from '../../src/services/planLimitsService';
import { withDemoTenant, getDemoTenant } from '../helpers/tenantContext';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('planLimitsService', () => {
  it('getMaxTurnosMes devuelve null con DEV_UNLIMITED', async () => {
    const prev = process.env.DEV_UNLIMITED;
    process.env.DEV_UNLIMITED = 'true';
    await withDemoTenant(async () => {
      const tenant = await getDemoTenant();
      expect(getMaxTurnosMes(tenant.plan, tenant.config_json as Record<string, unknown>)).toBeNull();
    });
    process.env.DEV_UNLIMITED = prev;
  });

  it('assertCanCreateTurno no lanza con plan ilimitado', async () => {
    const prev = process.env.DEV_UNLIMITED;
    process.env.DEV_UNLIMITED = 'true';
    await withDemoTenant(async () => {
      await expect(assertCanCreateTurno()).resolves.toBeUndefined();
    });
    process.env.DEV_UNLIMITED = prev;
  });
});
