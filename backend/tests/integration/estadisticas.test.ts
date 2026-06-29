import { getResumen } from '../../src/services/estadisticasPanelService';
import { withDemoTenant } from '../helpers/tenantContext';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('estadisticasPanelService', () => {
  it('getResumen retorna métricas del mes', async () => {
    await withDemoTenant(async () => {
      const from = '2026-01-01T00:00:00.000Z';
      const to = '2026-12-31T23:59:59.999Z';
      const data = await getResumen(from, to);
      expect(data.totalTurnos).toBeGreaterThanOrEqual(0);
      expect(data).toHaveProperty('turnosPorDia');
      expect(data).toHaveProperty('tasaNoShow');
    });
  });
});
