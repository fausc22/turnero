import { getDisponibilidad } from '../../src/services/disponibilidadService';
import { withDemoTenant } from './tenantContext';

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Busca el primer slot disponible probando fechas preferidas y luego +1..+30 días.
 */
export async function getAvailableSlot(
  servicioIds: number[] = [1],
  preferredDates: string[] = [],
  profesionalId?: number
): Promise<{ fechaInicio: string; fecha: string }> {
  return withDemoTenant(async () => {
    const candidates = [...preferredDates];
    const start = new Date();
    for (let i = 1; i <= 30; i++) {
      candidates.push(addDays(start, i));
    }

    for (const fecha of candidates) {
      const slots = await getDisponibilidad({
        fecha,
        servicioIds,
        profesionalId,
      });
      if (slots.length > 0) {
        return { fechaInicio: slots[0].fechaInicio, fecha };
      }
    }

    throw new Error(
      'No hay slots disponibles en los próximos 30 días. Ejecutá npm run seed:refresh-demo -w backend'
    );
  });
}

/** Devuelve al menos `minCount` slots en la misma fecha (para tests de overlap). */
export async function getAvailableSlots(
  minCount = 2,
  servicioIds: number[] = [1]
): Promise<{ fechaInicio: string; fecha: string }[]> {
  return withDemoTenant(async () => {
    const start = new Date();
    for (let i = 1; i <= 30; i++) {
      const fecha = addDays(start, i);
      const slots = await getDisponibilidad({ fecha, servicioIds });
      if (slots.length >= minCount) {
        return slots.slice(0, minCount).map((s) => ({ fechaInicio: s.fechaInicio, fecha }));
      }
    }
    throw new Error(
      `Se necesitan ${minCount} slots en un día. Ejecutá npm run seed:refresh-demo -w backend`
    );
  });
}
