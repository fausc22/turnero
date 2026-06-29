import * as politicasRepo from '../repositories/tenant/politicasRepository';
import { testMpConnection } from './mercadoPagoTenantService';
import { AppError } from '../utils/errors';

function mapPoliticas(row: politicasRepo.PoliticasReservaRow) {
  return {
    anticipacionMinimaMinutos: row.anticipacion_minima_minutos,
    anticipacionMaximaDias: row.anticipacion_maxima_dias,
    cancelacionHorasMinimas: row.cancelacion_horas_minimas,
    bufferMinutos: row.buffer_minutos,
    slotGranularidadMinutos: row.slot_granularidad_minutos,
    modoPago: row.modo_pago,
    señaPorcentaje: row.seña_porcentaje,
    señaMontoFijo: row.seña_monto_fijo,
    mpAccessTokenMasked: politicasRepo.maskMpToken(row.mp_access_token),
    mpConfigured: !!row.mp_access_token,
  };
}

export async function getPoliticasReserva() {
  const row = await politicasRepo.getPoliticas();
  if (!row) throw new AppError(500, 'CONFIG_ERROR', 'Políticas no configuradas');
  return mapPoliticas(row);
}

export async function updatePoliticasReserva(input: {
  anticipacionMinimaMinutos?: number;
  anticipacionMaximaDias?: number;
  cancelacionHorasMinimas?: number;
  bufferMinutos?: number;
  slotGranularidadMinutos?: number;
  modoPago?: string;
  señaPorcentaje?: number | null;
  señaMontoFijo?: number | null;
  mpAccessToken?: string | null;
}) {
  const mpToken =
    input.mpAccessToken !== undefined ? input.mpAccessToken || null : undefined;

  const updated = await politicasRepo.updatePoliticas({
    anticipacionMinimaMinutos: input.anticipacionMinimaMinutos,
    anticipacionMaximaDias: input.anticipacionMaximaDias,
    cancelacionHorasMinimas: input.cancelacionHorasMinimas,
    bufferMinutos: input.bufferMinutos,
    slotGranularidadMinutos: input.slotGranularidadMinutos,
    modoPago: input.modoPago,
    señaPorcentaje: input.señaPorcentaje,
    señaMontoFijo: input.señaMontoFijo,
    mpAccessToken: mpToken,
  });

  if (!updated) throw new AppError(500, 'CONFIG_ERROR', 'No se pudieron actualizar políticas');
  return mapPoliticas(updated);
}

export async function testMpToken(mpAccessToken?: string) {
  const politicas = await politicasRepo.getPoliticas();
  const token = mpAccessToken || politicas?.mp_access_token;
  if (!token) throw new AppError(400, 'MP_NOT_CONFIGURED', 'Token no configurado');
  return testMpConnection(token);
}
