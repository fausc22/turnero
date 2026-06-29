import { barberiaRepository } from '../repositories/barberiaRepository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { createBarberiaSchema, updateBarberiaSchema } from '../utils/validations';
import { Barberia } from '../types';

class BarberiaService {
  async findAll(): Promise<Barberia[]> {
    return barberiaRepository.findAll();
  }

  async findById(id: number): Promise<Barberia> {
    const barberia = await barberiaRepository.findById(id);
    if (!barberia) {
      throw new NotFoundError('Barbería');
    }
    return barberia;
  }

  async findBySlug(slug: string): Promise<Barberia> {
    const barberia = await barberiaRepository.findBySlug(slug);
    if (!barberia) {
      throw new NotFoundError('Barbería');
    }
    return barberia;
  }

  async create(data: unknown): Promise<Barberia> {
    const validated = createBarberiaSchema.parse(data);

    const existing = await barberiaRepository.findBySlug(validated.slug);
    if (existing) {
      throw new ConflictError('Ya existe una barbería con ese slug');
    }

    const id = await barberiaRepository.create({
      ...validated,
      telefono: validated.telefono ?? null,
    });
    const barberia = await barberiaRepository.findById(id);
    
    if (!barberia) {
      throw new Error('Error al crear barbería');
    }

    return barberia;
  }

  async update(id: number, data: unknown): Promise<Barberia> {
    const validated = updateBarberiaSchema.parse(data);

    const existing = await barberiaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Barbería');
    }

    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await barberiaRepository.findBySlug(validated.slug);
      if (slugExists) {
        throw new ConflictError('Ya existe una barbería con ese slug');
      }
    }

    await barberiaRepository.update(id, validated);
    const updated = await barberiaRepository.findById(id);
    
    if (!updated) {
      throw new Error('Error al actualizar barbería');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const barberia = await barberiaRepository.findById(id);
    if (!barberia) {
      throw new NotFoundError('Barbería');
    }

    await barberiaRepository.delete(id);
  }
}

export const barberiaService = new BarberiaService();

