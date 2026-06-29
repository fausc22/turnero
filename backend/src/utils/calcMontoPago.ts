import { AppError } from './errors';

export type ModoPago =
  | 'SIN_PAGO'
  | 'SEÑA_PORCENTAJE'
  | 'SEÑA_FIJA'
  | 'PAGO_TOTAL'
  | 'PAGO_EN_LOCAL';

export function requiresMercadoPago(modoPago: string): boolean {
  return ['SEÑA_PORCENTAJE', 'SEÑA_FIJA', 'PAGO_TOTAL'].includes(modoPago);
}

export function isPagoOnlineConfigured(politicas: {
  modo_pago: string;
  mp_access_token?: string | null;
}): boolean {
  return requiresMercadoPago(politicas.modo_pago) && !!politicas.mp_access_token?.trim();
}

export function calcMontoPago(
  modoPago: string,
  precioTotal: number,
  señaPorcentaje: number | null,
  señaMontoFijo: number | null
): number {
  let monto: number;

  switch (modoPago) {
    case 'SEÑA_PORCENTAJE':
      if (señaPorcentaje == null || señaPorcentaje <= 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Porcentaje de seña no configurado');
      }
      monto = Math.round(precioTotal * (señaPorcentaje / 100) * 100) / 100;
      break;
    case 'SEÑA_FIJA':
      if (señaMontoFijo == null || señaMontoFijo <= 0) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Monto de seña fijo no configurado');
      }
      monto = señaMontoFijo;
      break;
    case 'PAGO_TOTAL':
      monto = precioTotal;
      break;
    default:
      throw new AppError(400, 'VALIDATION_ERROR', 'Modo de pago no requiere Mercado Pago');
  }

  if (monto <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Monto de pago inválido');
  }

  return monto;
}
