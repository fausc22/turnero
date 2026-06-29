import { clienteRepository } from '../repositories/clienteRepository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { createClienteSchema, updateClienteSchema } from '../utils/validations';
import { Cliente } from '../types';

class ClienteService {
  async findAll(barberiaId: number): Promise<Cliente[]> {
    return clienteRepository.findAll(barberiaId);
  }

  async findById(id: number, barberiaId: number): Promise<Cliente> {
    const cliente = await clienteRepository.findById(id, barberiaId);
    if (!cliente) {
      throw new NotFoundError('Cliente');
    }
    return cliente;
  }

  async create(barberiaId: number, data: unknown): Promise<Cliente> {
    const validated = createClienteSchema.parse(data);

    if (validated.email) {
      const existing = await clienteRepository.findByEmail(validated.email, barberiaId);
      if (existing) {
        throw new ConflictError('Ya existe un cliente con ese email en esta barbería');
      }
    }

    const id = await clienteRepository.create({
      ...validated,
      barberia_id: barberiaId,
      email: validated.email ?? null,
      telefono: validated.telefono ?? null,
    });

    const cliente = await clienteRepository.findById(id, barberiaId);
    if (!cliente) {
      throw new Error('Error al crear cliente');
    }

    return cliente;
  }

  async update(id: number, barberiaId: number, data: unknown): Promise<Cliente> {
    const validated = updateClienteSchema.parse(data);

    const existing = await clienteRepository.findById(id, barberiaId);
    if (!existing) {
      throw new NotFoundError('Cliente');
    }

    if (validated.email && validated.email !== existing.email) {
      const emailExists = await clienteRepository.findByEmail(validated.email, barberiaId);
      if (emailExists) {
        throw new ConflictError('Ya existe un cliente con ese email en esta barbería');
      }
    }

    await clienteRepository.update(id, barberiaId, validated);
    const updated = await clienteRepository.findById(id, barberiaId);
    
    if (!updated) {
      throw new Error('Error al actualizar cliente');
    }

    return updated;
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    const cliente = await clienteRepository.findById(id, barberiaId);
    if (!cliente) {
      throw new NotFoundError('Cliente');
    }

    await clienteRepository.delete(id, barberiaId);
  }
}

export const clienteService = new ClienteService();

