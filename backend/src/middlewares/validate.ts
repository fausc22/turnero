import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: z.ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      if (target === 'query') req.query = parsed as typeof req.query;
      else if (target === 'params') req.params = parsed as typeof req.params;
      else req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        next(new ValidationError(messages.join(', ')));
      } else {
        next(new ValidationError('Error de validación'));
      }
    }
  };
}

