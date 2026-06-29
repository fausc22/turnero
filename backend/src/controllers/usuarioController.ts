import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { usuarioService } from '../services/usuarioService';

class UsuarioController {
  async findAll(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const barberiaId = req.user?.barberiaId || undefined;
      const usuarios = await usuarioService.findAll(barberiaId || undefined);
      res.json({ success: true, data: usuarios });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const usuario = await usuarioService.findById(id);
      res.json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await usuarioService.create(req.body);
      res.status(201).json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const usuario = await usuarioService.update(id, req.body);
      res.json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await usuarioService.delete(id);
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const usuarioController = new UsuarioController();

