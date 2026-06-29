import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export function buildDateRange(maxDays: number): { value: string; label: string; dayLabel: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = [];
  for (let i = 0; i < maxDays; i++) {
    const d = addDays(today, i);
    result.push({
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE d', { locale: es }),
      dayLabel: format(d, 'EEE', { locale: es }),
    });
  }
  return result;
}

export function canConfirmWithoutMp(modoPago: string): boolean {
  return modoPago === 'SIN_PAGO' || modoPago === 'PAGO_EN_LOCAL';
}

/** @deprecated use canConfirmWithoutMp or pagoOnlineDisponible */
export function canConfirmPayment(modoPago: string): boolean {
  return canConfirmWithoutMp(modoPago);
}
