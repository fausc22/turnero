import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { servicioService } from '../services/servicioService';

class ServicioController {
  async findAll(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const activosOnly = req.query.activos === 'true';
      const servicios = await servicioService.findAll(barberiaId, activosOnly);
      res.json({ success: true, data: servicios });
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
      const servicio = await servicioService.findById(id, barberiaId);
      res.json({ success: true, data: servicio });
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
      const servicio = await servicioService.create(barberiaId, req.body);
      res.status(201).json({ success: true, data: servicio });
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
      const servicio = await servicioService.update(id, barberiaId, req.body);
      res.json({ success: true, data: servicio });
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
      await servicioService.delete(id, barberiaId);
      res.json({ success: true, message: 'Servicio eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const servicioController = new ServicioController();

