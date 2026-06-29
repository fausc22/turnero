import { Request, Response, NextFunction } from 'express';
import { barberiaService } from '../services/barberiaService';

class BarberiaController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberias = await barberiaService.findAll();
      res.json({ success: true, data: barberias });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const barberia = await barberiaService.findById(id);
      res.json({ success: true, data: barberia });
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const barberia = await barberiaService.findBySlug(slug);
      res.json({ success: true, data: barberia });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberia = await barberiaService.create(req.body);
      res.status(201).json({ success: true, data: barberia });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const barberia = await barberiaService.update(id, req.body);
      res.json({ success: true, data: barberia });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await barberiaService.delete(id);
      res.json({ success: true, message: 'Barbería eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const barberiaController = new BarberiaController();

