import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { productoService } from '../services/productoService';

class ProductoController {
  async findAll(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const activosOnly = req.query.activos === 'true';
      const productos = await productoService.findAll(barberiaId, activosOnly);
      res.json({ success: true, data: productos });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const producto = await productoService.findById(id, barberiaId);
      res.json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  }

  async create(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const producto = await productoService.create(barberiaId, req.body);
      res.status(201).json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  }

  async update(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const producto = await productoService.update(id, barberiaId, req.body);
      res.json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      await productoService.delete(id, barberiaId);
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const productoController = new ProductoController();

