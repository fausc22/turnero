import crypto from 'crypto';
import { crearReserva } from '../../src/services/reservaPublicaService';
import { withDemoTenant } from '../helpers/tenantContext';
import { getAvailableSlot } from '../helpers/slots';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('reserva concurrente', () => {
  it('dos conexiones al mismo slot: exactamente una gana', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const telefonoA = `11${Date.now().toString().slice(-8)}`;
      const telefonoB = `11${(Date.now() + 1).toString().slice(-8)}`;

      const results = await Promise.allSettled([
        crearReserva({
          servicioIds: [1],
          fechaInicio,
          cliente: { nombre: 'Concurrente A', telefono: telefonoA },
          idempotencyKey: crypto.randomUUID(),
        }),
        crearReserva({
          servicioIds: [1],
          fechaInicio,
          cliente: { nombre: 'Concurrente B', telefono: telefonoB },
          idempotencyKey: crypto.randomUUID(),
        }),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      const err = (rejected[0] as PromiseRejectedResult).reason as { code?: string };
      expect(err.code).toBe('SLOT_TAKEN');
    });
  });

  it('idempotency key concurrente: un solo turno', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const key = crypto.randomUUID();
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const results = await Promise.all([
        crearReserva({
          servicioIds: [1],
          fechaInicio,
          cliente: { nombre: 'Idem Conc', telefono },
          idempotencyKey: key,
        }),
        crearReserva({
          servicioIds: [1],
          fechaInicio,
          cliente: { nombre: 'Idem Conc', telefono },
          idempotencyKey: key,
        }),
      ]);
      expect(results[0].turnoId).toBe(results[1].turnoId);
    });
  });
});
