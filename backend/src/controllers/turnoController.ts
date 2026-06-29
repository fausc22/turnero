import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { turnoService } from '../services/turnoService';

class TurnoController {
  async findAll(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const filters: any = {};
      if (req.query.estado) filters.estado = req.query.estado;
      if (req.query.fechaDesde) filters.fechaDesde = new Date(req.query.fechaDesde as string);
      if (req.query.fechaHasta) filters.fechaHasta = new Date(req.query.fechaHasta as string);
      
      const turnos = await turnoService.findAll(barberiaId, filters);
      res.json({ success: true, data: turnos });
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
      const turno = await turnoService.findById(id, barberiaId);
      res.json({ success: true, data: turno });
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
      const turno = await turnoService.create(barberiaId, req.body);
      res.status(201).json({ success: true, data: turno });
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
      const turno = await turnoService.update(id, barberiaId, req.body);
      res.json({ success: true, data: turno });
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
      await turnoService.delete(id, barberiaId);
      res.json({ success: true, message: 'Turno eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const turnoController = new TurnoController();

