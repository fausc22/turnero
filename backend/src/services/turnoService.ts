import { turnoRepository } from '../repositories/turnoRepository';
import { servicioRepository } from '../repositories/servicioRepository';
import { productoRepository } from '../repositories/productoRepository';
import { clienteRepository } from '../repositories/clienteRepository';
import { horarioRepository } from '../repositories/horarioRepository';
import { db } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { createTurnoSchema, updateTurnoSchema } from '../utils/validations';
import { Turno } from '../types';

class TurnoService {
  async findAll(barberiaId: number, filters?: any): Promise<Turno[]> {
    return turnoRepository.findAll(barberiaId, filters);
  }

  async findById(id: number, barberiaId: number): Promise<Turno> {
    const turno = await turnoRepository.findById(id, barberiaId);
    if (!turno) {
      throw new NotFoundError('Turno');
    }
    return turno;
  }

  async create(barberiaId: number, data: unknown): Promise<Turno> {
    const validated = createTurnoSchema.parse(data);

    const cliente = await clienteRepository.findById(validated.cliente_id, barberiaId);
    if (!cliente) {
      throw new NotFoundError('Cliente');
    }

    const fechaInicio = new Date(validated.fecha_inicio);
    const fechaFin = new Date(validated.fecha_fin);

    if (fechaInicio >= fechaFin) {
      throw new ValidationError('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const overlaps = await turnoRepository.checkOverlap(barberiaId, fechaInicio, fechaFin);
    if (overlaps.length > 0) {
      throw new ConflictError('Ya existe un turno en ese horario');
    }

    const bloqueos = await horarioRepository.findBloqueosByBarberia(barberiaId, fechaInicio, fechaFin);
    if (bloqueos.length > 0) {
      throw new ConflictError('El horario está bloqueado');
    }

    let precioTotal = 0;

    if (validated.servicios && validated.servicios.length > 0) {
      for (const servicioId of validated.servicios) {
        const servicio = await servicioRepository.findById(servicioId, barberiaId);
        if (!servicio || !servicio.activo) {
          throw new NotFoundError(`Servicio con ID ${servicioId}`);
        }
        precioTotal += parseFloat(servicio.precio.toString());
      }
    }

    if (validated.productos && validated.productos.length > 0) {
      for (const item of validated.productos) {
        const producto = await productoRepository.findById(item.producto_id, barberiaId);
        if (!producto || !producto.activo) {
          throw new NotFoundError(`Producto con ID ${item.producto_id}`);
        }
        if (producto.stock_actual < item.cantidad) {
          throw new ValidationError(`Stock insuficiente para el producto ${producto.nombre}`);
        }
        precioTotal += parseFloat(producto.precio.toString()) * item.cantidad;
      }
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const turnoId = await turnoRepository.create({
        barberia_id: barberiaId,
        cliente_id: validated.cliente_id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: validated.estado,
        precio_total: precioTotal
      });

      if (validated.servicios) {
        for (const servicioId of validated.servicios) {
          const servicio = await servicioRepository.findById(servicioId, barberiaId);
          if (servicio) {
            await connection.execute(
              'INSERT INTO turno_servicios (turno_id, servicio_id, precio_unitario) VALUES (?, ?, ?)',
              [turnoId, servicioId, servicio.precio]
            );
          }
        }
      }

      if (validated.productos) {
        for (const item of validated.productos) {
          const producto = await productoRepository.findById(item.producto_id, barberiaId);
          if (producto) {
            await connection.execute(
              'INSERT INTO turno_productos (turno_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
              [turnoId, item.producto_id, item.cantidad, producto.precio]
            );

            await productoRepository.update(item.producto_id, barberiaId, {
              stock_actual: producto.stock_actual - item.cantidad
            });
          }
        }
      }

      await connection.commit();
      connection.release();

      const turno = await turnoRepository.findById(turnoId, barberiaId);
      if (!turno) {
        throw new Error('Error al crear turno');
      }

      return turno;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  async update(id: number, barberiaId: number, data: unknown): Promise<Turno> {
    const validated = updateTurnoSchema.parse(data);

    const existing = await turnoRepository.findById(id, barberiaId);
    if (!existing) {
      throw new NotFoundError('Turno');
    }

    if (validated.fecha_inicio || validated.fecha_fin) {
      const fechaInicio = validated.fecha_inicio ? new Date(validated.fecha_inicio) : existing.fecha_inicio;
      const fechaFin = validated.fecha_fin ? new Date(validated.fecha_fin) : existing.fecha_fin;

      if (fechaInicio >= fechaFin) {
        throw new ValidationError('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      const overlaps = await turnoRepository.checkOverlap(barberiaId, fechaInicio, fechaFin, id);
      if (overlaps.length > 0) {
        throw new ConflictError('Ya existe un turno en ese horario');
      }
    }

    const updateData: any = {};
    if (validated.cliente_id) updateData.cliente_id = validated.cliente_id;
    if (validated.fecha_inicio) updateData.fecha_inicio = new Date(validated.fecha_inicio);
    if (validated.fecha_fin) updateData.fecha_fin = new Date(validated.fecha_fin);
    if (validated.estado) updateData.estado = validated.estado;

    await turnoRepository.update(id, barberiaId, updateData);
    const updated = await turnoRepository.findById(id, barberiaId);
    
    if (!updated) {
      throw new Error('Error al actualizar turno');
    }

    return updated;
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    const turno = await turnoRepository.findById(id, barberiaId);
    if (!turno) {
      throw new NotFoundError('Turno');
    }

    await turnoRepository.delete(id, barberiaId);
  }
}

export const turnoService = new TurnoService();

