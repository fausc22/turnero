import { PoolConnection } from 'mysql2/promise';
import * as clienteRepo from '../repositories/tenant/clienteRepository';
import { normalizePhone } from '../utils/phone';
import { AppError } from '../utils/errors';

export interface UpsertClienteInput {
  nombre: string;
  telefono: string;
  email?: string | null;
}

export async function upsertByTelefono(
  input: UpsertClienteInput,
  conn: PoolConnection
): Promise<number> {
  const telefonoNormalizado = normalizePhone(input.telefono);
  if (!telefonoNormalizado) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Teléfono inválido');
  }

  return clienteRepo.upsertByTelefono(
    {
      nombre: input.nombre,
      telefono: input.telefono,
      telefonoNormalizado,
      email: input.email || null,
    },
    conn
  );
}
