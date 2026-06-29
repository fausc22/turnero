import { crearReserva } from '../../src/services/reservaPublicaService';
import { getReservaByToken } from '../../src/services/reservaPublicaService';
import { processPaymentForTenant } from '../../src/services/mercadoPagoTenantService';
import { buildMpExternalReference } from '../../src/utils/mpExternalReference';
import { getDisponibilidad } from '../../src/services/disponibilidadService';
import * as politicasRepo from '../../src/repositories/tenant/politicasRepository';
import * as pagoRepo from '../../src/repositories/tenant/pagoRepository';
import { withDemoTenant } from '../helpers/tenantContext';

const skipDb = process.env.CI_SKIP_DB === 'true';
const TENANT_SLUG = 'peluqueria-naz';

async function slotsForDate(fecha: string) {
  const slots = await getDisponibilidad({ fecha, servicioIds: [1] });
  if (slots.length > 0) return slots;
  return getDisponibilidad({ fecha: '2026-06-16', servicioIds: [1] });
}

(skipDb ? describe.skip : describe)('mp webhook', () => {
  beforeEach(async () => {
    await withDemoTenant(async () => {
      await politicasRepo.updatePoliticas({
        modoPago: 'SEÑA_PORCENTAJE',
        señaPorcentaje: 50,
        mpAccessToken: process.env.MP_TEST_ACCESS_TOKEN || 'TEST-TOKEN',
      });
    });
  });

  afterEach(async () => {
    await withDemoTenant(async () => {
      await politicasRepo.updatePoliticas({ modoPago: 'SIN_PAGO', mpAccessToken: null });
    });
  });

  it('approved confirma turno PENDIENTE e inserta pago', async () => {
    await withDemoTenant(async () => {
      const slots = await slotsForDate('2026-06-22');
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const reserva = await crearReserva({
        servicioIds: [1],
        fechaInicio: slots[0].fechaInicio,
        cliente: { nombre: 'MP Test', telefono },
      });

      expect(reserva.estado).toBe('PENDIENTE');

      const paymentId = Date.now();
      await processPaymentForTenant(TENANT_SLUG, {
        id: paymentId,
        status: 'approved',
        transaction_amount: reserva.precioTotal * 0.5,
        external_reference: buildMpExternalReference(TENANT_SLUG, reserva.turnoId),
      });

      const turno = await getReservaByToken(reserva.tokenGestion);
      expect(turno.estado).toBe('CONFIRMADO');

      const pago = await pagoRepo.findByIdempotencyKey(String(paymentId));
      expect(pago?.estado).toBe('PAGADO');
    });
  });

  it('rejected mantiene turno PENDIENTE', async () => {
    await withDemoTenant(async () => {
      const slots = await slotsForDate('2026-06-23');
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const reserva = await crearReserva({
        servicioIds: [1],
        fechaInicio: slots[0].fechaInicio,
        cliente: { nombre: 'MP Reject', telefono },
      });

      await processPaymentForTenant(TENANT_SLUG, {
        id: Date.now(),
        status: 'rejected',
        transaction_amount: 100,
        external_reference: buildMpExternalReference(TENANT_SLUG, reserva.turnoId),
      });

      const turno = await getReservaByToken(reserva.tokenGestion);
      expect(turno.estado).toBe('PENDIENTE');
    });
  });

  it('idempotencia ignora pago duplicado', async () => {
    await withDemoTenant(async () => {
      const slots = await slotsForDate('2026-06-24');
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const reserva = await crearReserva({
        servicioIds: [1],
        fechaInicio: slots[0].fechaInicio,
        cliente: { nombre: 'MP Idem', telefono },
      });

      const paymentId = Date.now() + 1;
      const payment = {
        id: paymentId,
        status: 'approved' as const,
        transaction_amount: 500,
        external_reference: buildMpExternalReference(TENANT_SLUG, reserva.turnoId),
      };

      await processPaymentForTenant(TENANT_SLUG, payment);
      await processPaymentForTenant(TENANT_SLUG, payment);

      const pagos = await pagoRepo.list({ limit: 500 });
      const matches = pagos.filter((p) => p.idempotency_key === String(paymentId));
      expect(matches.length).toBe(1);
    });
  });
});
