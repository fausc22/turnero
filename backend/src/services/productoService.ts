import { productoRepository } from '../repositories/productoRepository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { createProductoSchema, updateProductoSchema } from '../utils/validations';
import { Producto } from '../types';

class ProductoService {
  async findAll(barberiaId: number, activosOnly = false): Promise<Producto[]> {
    return productoRepository.findAll(barberiaId, activosOnly);
  }

  async findById(id: number, barberiaId: number): Promise<Producto> {
    const producto = await productoRepository.findById(id, barberiaId);
    if (!producto) {
      throw new NotFoundError('Producto');
    }
    return producto;
  }

  async create(barberiaId: number, data: unknown): Promise<Producto> {
    const validated = createProductoSchema.parse(data);

    const id = await productoRepository.create({
      ...validated,
      barberia_id: barberiaId
    });

    const producto = await productoRepository.findById(id, barberiaId);
    if (!producto) {
      throw new Error('Error al crear producto');
    }

    return producto;
  }

  async update(id: number, barberiaId: number, data: unknown): Promise<Producto> {
    const validated = updateProductoSchema.parse(data);

    const existing = await productoRepository.findById(id, barberiaId);
    if (!existing) {
      throw new NotFoundError('Producto');
    }

    if (validated.stock_actual !== undefined && validated.stock_actual < 0) {
      throw new ValidationError('El stock no puede ser negativo');
    }

    await productoRepository.update(id, barberiaId, validated);
    const updated = await productoRepository.findById(id, barberiaId);
    
    if (!updated) {
      throw new Error('Error al actualizar producto');
    }

    return updated;
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    const producto = await productoRepository.findById(id, barberiaId);
    if (!producto) {
      throw new NotFoundError('Producto');
    }

    await productoRepository.delete(id, barberiaId);
  }
}

export const productoService = new ProductoService();

