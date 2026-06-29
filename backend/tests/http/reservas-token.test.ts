import { crearReserva } from '../../src/services/reservaPublicaService';
import { withDemoTenant } from '../helpers/tenantContext';
import { getAvailableSlot } from '../helpers/slots';
import { api, tenantHeaders, DEMO_TENANT } from '../helpers/http';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('HTTP reservas token', () => {
  it('cancelar por token vía HTTP', async () => {
    const { fechaInicio } = await getAvailableSlot([1]);
    const telefono = `11${Date.now().toString().slice(-8)}`;

    const reserva = await withDemoTenant(() =>
      crearReserva({
        servicioIds: [1],
        fechaInicio,
        cliente: { nombre: 'Cancel HTTP', telefono },
      })
    );

    expect(reserva.tokenGestion).toBeTruthy();

    await api()
      .post(`/api/public/reservas/${reserva.tokenGestion}/cancelar`)
      .set(tenantHeaders(DEMO_TENANT))
      .expect(200);

    const detail = await api()
      .get(`/api/public/reservas/${reserva.tokenGestion}`)
      .set(tenantHeaders(DEMO_TENANT))
      .expect(200);

    expect(detail.body.data.estado).toBe('CANCELADO');
  });

  it('token inválido retorna 404', async () => {
    const res = await api()
      .post('/api/public/reservas/invalid-token-xyz/cancelar')
      .set(tenantHeaders(DEMO_TENANT))
      .expect(404);

    expect(res.body.error).toBeTruthy();
  });
});
