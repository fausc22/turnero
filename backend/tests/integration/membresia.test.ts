import { crearReserva } from '../../src/services/reservaPublicaService';
import { getDisponibilidad } from '../../src/services/disponibilidadService';
import { patchEstado } from '../../src/services/turnoPanelService';
import * as membresiaRepo from '../../src/repositories/tenant/membresiaRepository';
import { calcularPuntos } from '../../src/services/membresiaService';
import { withDemoTenant } from '../helpers/tenantContext';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('membresia puntos', () => {
  it('calcularPuntos 1 por cada $100', () => {
    expect(calcularPuntos(8000)).toBe(80);
    expect(calcularPuntos(50)).toBe(0);
  });

  it('COMPLETADO acumula puntos', async () => {
    await withDemoTenant(async () => {
      const slots = await getDisponibilidad({ fecha: '2026-06-25', servicioIds: [1] });
      expect(slots.length).toBeGreaterThan(0);
      const telefono = `11${Date.now().toString().slice(-8)}`;

      const res = await crearReserva({
        servicioIds: [1],
        fechaInicio: slots[slots.length - 1].fechaInicio,
        cliente: { nombre: 'Membresia Test', telefono },
      });

      if (res.estado !== 'CONFIRMADO') return;

      await patchEstado(res.turnoId, 'COMPLETADO', { rol: 'GERENTE' });

      const turno = await import('../../src/repositories/tenant/turnoRepository').then((m) =>
        m.findById(res.turnoId)
      );
      if (!turno) return;

      const puntos = await membresiaRepo.getPuntos(turno.cliente_id);
      expect(puntos).toBeGreaterThan(0);
    });
  });
});
