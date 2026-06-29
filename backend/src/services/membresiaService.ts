import * as membresiaRepo from '../repositories/tenant/membresiaRepository';
import logger from '../config/logger';

const PUNTOS_POR_CADA = 100;

export function calcularPuntos(montoTurno: number): number {
  return Math.floor(montoTurno / PUNTOS_POR_CADA);
}

export async function acumularPuntos(clienteId: number, montoTurno: number): Promise<number> {
  const puntos = calcularPuntos(montoTurno);
  if (puntos <= 0) return 0;
  try {
    await membresiaRepo.addPuntos(clienteId, puntos);
    return puntos;
  } catch (err) {
    logger.error('membresiaService.acumularPuntos', {
      clienteId,
      error: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}
