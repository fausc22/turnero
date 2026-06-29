import crypto from 'crypto';
import { getDisponibilidad } from '../../src/services/disponibilidadService';
import { crearReserva } from '../../src/services/reservaPublicaService';
import { withDemoTenant } from '../helpers/tenantContext';
import { getAvailableSlot } from '../helpers/slots';

const skipDb = process.env.CI_SKIP_DB === 'true';

async function bookNextSlot(
  fecha: string,
  servicioIds: number[],
  exclude: string[],
  cliente: { nombre: string; telefono: string }
) {
  const candidatos = await getDisponibilidad({ fecha, servicioIds });
  for (const s of candidatos) {
    if (exclude.includes(s.fechaInicio)) continue;
    try {
      return await crearReserva({
        servicioIds,
        fechaInicio: s.fechaInicio,
        cliente,
      });
    } catch (err) {
      if ((err as { code?: string }).code !== 'SLOT_TAKEN') throw err;
    }
  }
  throw new Error(`No hay slot libre en ${fecha}`);
}

(skipDb ? describe.skip : describe)('reservaPublicaService', () => {
  it('crea reserva happy path', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const result = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Test Jest', telefono },
      });

      expect(result.turnoId).toBeGreaterThan(0);
      expect(result.tokenGestion).toBeTruthy();
      expect(['CONFIRMADO', 'PENDIENTE']).toContain(result.estado);
    });
  });

  it('idempotency evita duplicados', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const key = crypto.randomUUID();
      const telefono = `11${Date.now().toString().slice(-8)}`;

      const first = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Idem Test', telefono },
        idempotencyKey: key,
      });

      const second = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Idem Test', telefono },
        idempotencyKey: key,
      });

      expect(second.turnoId).toBe(first.turnoId);
    });
  });

  it('cliente upsert mismo teléfono', async () => {
    const { fechaInicio, fecha } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const telefono = `11${Date.now().toString().slice(-8)}`;

      const r1 = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Nombre A', telefono },
      });

      const r2 = await bookNextSlot(
        fecha,
        [1],
        [fechaInicio],
        { nombre: 'Nombre B', telefono }
      );

      expect(r1.turnoId).not.toBe(r2.turnoId);
    });
  });
});
