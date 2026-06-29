import { Request, Response, NextFunction } from 'express';
import { getPublicConfig } from '../../services/publicConfigService';

export async function getConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await getPublicConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}
