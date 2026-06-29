import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { clienteService } from '../services/clienteService';

class ClienteController {
  async findAll(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const clientes = await clienteService.findAll(barberiaId);
      res.json({ success: true, data: clientes });
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
      const cliente = await clienteService.findById(id, barberiaId);
      res.json({ success: true, data: cliente });
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
      const cliente = await clienteService.create(barberiaId, req.body);
      res.status(201).json({ success: true, data: cliente });
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
      const cliente = await clienteService.update(id, barberiaId, req.body);
      res.json({ success: true, data: cliente });
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
      await clienteService.delete(id, barberiaId);
      res.json({ success: true, message: 'Cliente eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const clienteController = new ClienteController();

