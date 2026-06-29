import { RowDataPacket } from 'mysql2/promise';
import { executeTenantQuery } from '../../config/tenantDatabase';

export interface PoliticasReservaRow {
  id: number;
  anticipacion_minima_minutos: number;
  anticipacion_maxima_dias: number;
  cancelacion_horas_minimas: number;
  buffer_minutos: number;
  slot_granularidad_minutos: number;
  modo_pago: string;
  seña_porcentaje: number | null;
  seña_monto_fijo: number | null;
  mp_access_token: string | null;
}

export async function getPoliticas(): Promise<PoliticasReservaRow | null> {
  const rows = await executeTenantQuery<(PoliticasReservaRow & RowDataPacket)[]>(
    `SELECT id, anticipacion_minima_minutos, anticipacion_maxima_dias, cancelacion_horas_minimas,
            buffer_minutos, slot_granularidad_minutos, modo_pago, seña_porcentaje, seña_monto_fijo,
            mp_access_token
     FROM politicas_reserva WHERE id = 1`
  );
  return rows[0] ?? null;
}

export async function updatePoliticas(input: {
  anticipacionMinimaMinutos?: number;
  anticipacionMaximaDias?: number;
  cancelacionHorasMinimas?: number;
  bufferMinutos?: number;
  slotGranularidadMinutos?: number;
  modoPago?: string;
  señaPorcentaje?: number | null;
  señaMontoFijo?: number | null;
  mpAccessToken?: string | null;
}): Promise<PoliticasReservaRow | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.anticipacionMinimaMinutos !== undefined) {
    fields.push('anticipacion_minima_minutos = ?');
    params.push(input.anticipacionMinimaMinutos);
  }
  if (input.anticipacionMaximaDias !== undefined) {
    fields.push('anticipacion_maxima_dias = ?');
    params.push(input.anticipacionMaximaDias);
  }
  if (input.cancelacionHorasMinimas !== undefined) {
    fields.push('cancelacion_horas_minimas = ?');
    params.push(input.cancelacionHorasMinimas);
  }
  if (input.bufferMinutos !== undefined) {
    fields.push('buffer_minutos = ?');
    params.push(input.bufferMinutos);
  }
  if (input.slotGranularidadMinutos !== undefined) {
    fields.push('slot_granularidad_minutos = ?');
    params.push(input.slotGranularidadMinutos);
  }
  if (input.modoPago !== undefined) {
    fields.push('modo_pago = ?');
    params.push(input.modoPago);
  }
  if (input.señaPorcentaje !== undefined) {
    fields.push('seña_porcentaje = ?');
    params.push(input.señaPorcentaje);
  }
  if (input.señaMontoFijo !== undefined) {
    fields.push('seña_monto_fijo = ?');
    params.push(input.señaMontoFijo);
  }
  if (input.mpAccessToken !== undefined) {
    fields.push('mp_access_token = ?');
    params.push(input.mpAccessToken || null);
  }

  if (fields.length === 0) {
    return getPoliticas();
  }

  await executeTenantQuery(`UPDATE politicas_reserva SET ${fields.join(', ')} WHERE id = 1`, params);
  return getPoliticas();
}

export function maskMpToken(token: string | null): string | null {
  if (!token) return null;
  if (token.length <= 8) return '****';
  return `****${token.slice(-4)}`;
}
