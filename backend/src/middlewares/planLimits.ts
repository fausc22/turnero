import { Request, Response, NextFunction } from 'express';
import { assertCanCreateTurno } from '../services/planLimitsService';
import { AppError } from '../utils/errors';

export function checkPlanLimitsOnReserva(_req: Request, res: Response, next: NextFunction): void {
  void (async () => {
    try {
      await assertCanCreateTurno();
      next();
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({
          error: {
            code: err.code,
            message: err.message,
            details: err.details,
          },
        });
        return;
      }
      next(err);
    }
  })();
}
