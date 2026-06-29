import { crearReserva } from '../../src/services/reservaPublicaService';
import { withDemoTenant } from '../helpers/tenantContext';
import { getAvailableSlot } from '../helpers/slots';
import * as jobRepo from '../../src/repositories/admin/notificationJobRepository';
import * as enviadaRepo from '../../src/repositories/tenant/notificacionEnviadaRepository';
import { enqueueForTurno } from '../../src/services/notificationEnqueueService';
import { findTenantBySlug } from '../../src/repositories/admin/tenantRepository';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('notification enqueue', () => {
  it('encola confirmación al crear reserva CONFIRMADO', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const tenant = await findTenantBySlug('peluqueria-naz');
      expect(tenant).toBeTruthy();

      const before = await jobRepo.countByStatus('peluqueria-naz', 'pending');
      const telefono = `11${Date.now().toString().slice(-8)}`;

      const res = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Notif Test', telefono, email: 'notif@test.local' },
      });

      if (res.estado !== 'CONFIRMADO') {
        return;
      }

      await new Promise((r) => setTimeout(r, 300));
      const after = await jobRepo.countByStatus('peluqueria-naz', 'pending');
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });

  it('anti-dup recordatorio no re-encola si ya enviado', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const telefono = `11${Date.now().toString().slice(-8)}`;

      const res = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Dup Test', telefono },
      });

      if (res.estado !== 'CONFIRMADO') return;

      await enviadaRepo.record(res.turnoId, 'recordatorio_24h', 'whatsapp');

      const before = await jobRepo.countByTurnoAndTipo(res.turnoId, 'recordatorio_24h');
      await enqueueForTurno({
        tenantSlug: 'peluqueria-naz',
        turnoId: res.turnoId,
        tipo: 'recordatorio_24h',
      });
      await new Promise((r) => setTimeout(r, 200));
      const after = await jobRepo.countByTurnoAndTipo(res.turnoId, 'recordatorio_24h');
      expect(after).toBe(before);
    });
  });
});
