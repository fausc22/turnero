import { getDisponibilidad } from '../../src/services/disponibilidadService';
import { crearReserva } from '../../src/services/reservaPublicaService';
import {
  listTurnos,
  patchEstado,
  reprogramarTurno,
  getTurnoDetalle,
} from '../../src/services/turnoPanelService';
import { withDemoTenant } from '../helpers/tenantContext';
import { getAvailableSlot } from '../helpers/slots';

const skipDb = process.env.CI_SKIP_DB === 'true';
const gerenteActor = { rol: 'GERENTE', profesionalId: null };
const PROFESIONAL_ID = 1;

(skipDb ? describe.skip : describe)('turnoPanelService', () => {
  it('listTurnos filtra por rango de fechas', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const reserva = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Panel List Test', telefono },
      });

      const turnos = await listTurnos(
        {
          from: '2026-01-01T00:00:00.000Z',
          to: '2027-12-31T23:59:59.999Z',
          search: 'Panel List',
        },
        gerenteActor
      );

      expect(turnos.some((t) => t.id === reserva.turnoId)).toBe(true);
    });
  });

  it('patchEstado cambia CONFIRMADO a COMPLETADO', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    await withDemoTenant(async () => {
      const telefono = `11${Date.now().toString().slice(-8)}`;
      const reserva = await crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Patch Estado Test', telefono },
      });

      const detalle = await getTurnoDetalle(reserva.turnoId, gerenteActor);
      if (detalle.estado === 'PENDIENTE') {
        await patchEstado(reserva.turnoId, 'CONFIRMADO', gerenteActor);
      }

      const result = await patchEstado(reserva.turnoId, 'COMPLETADO', gerenteActor);
      expect(result.estado).toBe('COMPLETADO');
    });
  });

  it('reprogramarTurno falla con SLOT_TAKEN si el slot está ocupado', async () => {
    await withDemoTenant(async () => {
      const candidatosInicial = await getDisponibilidad({
        fecha: (await getAvailableSlot([1], [], PROFESIONAL_ID)).fecha,
        servicioIds: [1],
        profesionalId: PROFESIONAL_ID,
      });
      expect(candidatosInicial.length).toBeGreaterThan(0);

      const slot1 = candidatosInicial[0].fechaInicio;
      const telefono1 = `11${Date.now().toString().slice(-8)}`;
      const telefono2 = `11${(Date.now() + 1).toString().slice(-8)}`;

      const turno1 = await crearReserva({
        servicioIds: [1],
        profesionalId: PROFESIONAL_ID,
        fechaInicio: slot1,
        cliente: { nombre: 'Reprog A', telefono: telefono1 },
      });

      const fecha = slot1.slice(0, 10);
      const trasPrimera = await getDisponibilidad({
        fecha,
        servicioIds: [1],
        profesionalId: PROFESIONAL_ID,
      });

      let slot2: string | null = null;
      for (const s of trasPrimera) {
        if (s.fechaInicio === slot1) continue;
        try {
          await crearReserva({
            servicioIds: [1],
            profesionalId: PROFESIONAL_ID,
            fechaInicio: s.fechaInicio,
            cliente: { nombre: 'Reprog B', telefono: telefono2 },
          });
          slot2 = s.fechaInicio;
          break;
        } catch (err) {
          if ((err as { code?: string }).code !== 'SLOT_TAKEN') throw err;
        }
      }
      expect(slot2).toBeTruthy();

      await expect(
        reprogramarTurno(
          turno1.turnoId,
          { fechaInicio: slot2!, profesionalId: PROFESIONAL_ID },
          gerenteActor
        )
      ).rejects.toMatchObject({ code: 'SLOT_TAKEN' });
    });
  });
});
