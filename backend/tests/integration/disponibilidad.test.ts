import { getDisponibilidad } from '../../src/services/disponibilidadService';
import { withDemoTenant } from '../helpers/tenantContext';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('disponibilidadService', () => {
  it('retorna slots dentro del horario operativo', async () => {
    await withDemoTenant(async () => {
      const slots = await getDisponibilidad({
        fecha: '2026-06-15',
        servicioIds: [1],
      });
      expect(slots.length).toBeGreaterThan(0);
      const first = slots[0];
      expect(first.profesionalId).toBeTruthy();
      expect(new Date(first.fechaInicio).getHours()).toBeGreaterThanOrEqual(9);
    });
  });

  it('excluye slots que no entran antes del cierre (duración larga)', async () => {
    await withDemoTenant(async () => {
      const slots = await getDisponibilidad({
        fecha: '2026-06-15',
        servicioIds: [3],
      });
      for (const slot of slots) {
        const end = new Date(slot.fechaFin);
        expect(end.getHours()).toBeLessThanOrEqual(19);
      }
    });
  });

  it('retorna vacío para domingo sin horario', async () => {
    await withDemoTenant(async () => {
      const slots = await getDisponibilidad({
        fecha: '2026-06-14',
        servicioIds: [1],
      });
      expect(slots).toHaveLength(0);
    });
  });
});
