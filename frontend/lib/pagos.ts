import type { ModoPago, PublicConfig } from '@/types/public';

export function requiresMercadoPago(modoPago: ModoPago): boolean {
  return ['SEÑA_PORCENTAJE', 'SEÑA_FIJA', 'PAGO_TOTAL'].includes(modoPago);
}

export function calcMontoDisplay(
  modoPago: ModoPago,
  precioTotal: number,
  politicas: PublicConfig['politicas']
): number | null {
  if (!politicas) return null;
  switch (modoPago) {
    case 'SEÑA_PORCENTAJE':
      if (!politicas.señaPorcentaje) return null;
      return Math.round(precioTotal * (politicas.señaPorcentaje / 100) * 100) / 100;
    case 'SEÑA_FIJA':
      return politicas.señaMontoFijo ?? null;
    case 'PAGO_TOTAL':
      return precioTotal;
    default:
      return null;
  }
}

export function paymentButtonLabel(modoPago: ModoPago, monto: number | null): string {
  if (monto == null) return 'Pagar';
  if (modoPago === 'PAGO_TOTAL') return `Pagar total $${monto}`;
  return `Pagar seña $${monto}`;
}
