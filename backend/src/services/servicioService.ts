import { servicioRepository } from '../repositories/servicioRepository';
import { NotFoundError } from '../utils/errors';
import { createServicioSchema, updateServicioSchema } from '../utils/validations';
import { Servicio } from '../types';

class ServicioService {
  async findAll(barberiaId: number, activosOnly = false): Promise<Servicio[]> {
    return servicioRepository.findAll(barberiaId, activosOnly);
  }

  async findById(id: number, barberiaId: number): Promise<Servicio> {
    const servicio = await servicioRepository.findById(id, barberiaId);
    if (!servicio) {
      throw new NotFoundError('Servicio');
    }
    return servicio;
  }

  async create(barberiaId: number, data: unknown): Promise<Servicio> {
    const validated = createServicioSchema.parse(data);

    const id = await servicioRepository.create({
      ...validated,
      barberia_id: barberiaId
    });

    const servicio = await servicioRepository.findById(id, barberiaId);
    if (!servicio) {
      throw new Error('Error al crear servicio');
    }

    return servicio;
  }

  async update(id: number, barberiaId: number, data: unknown): Promise<Servicio> {
    const validated = updateServicioSchema.parse(data);

    const existing = await servicioRepository.findById(id, barberiaId);
    if (!existing) {
      throw new NotFoundError('Servicio');
    }

    await servicioRepository.update(id, barberiaId, validated);
    const updated = await servicioRepository.findById(id, barberiaId);
    
    if (!updated) {
      throw new Error('Error al actualizar servicio');
    }

    return updated;
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    const servicio = await servicioRepository.findById(id, barberiaId);
    if (!servicio) {
      throw new NotFoundError('Servicio');
    }

    await servicioRepository.delete(id, barberiaId);
  }
}

export const servicioService = new ServicioService();

