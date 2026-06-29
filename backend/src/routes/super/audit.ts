import { Router, Request, Response, NextFunction } from 'express';
import * as auditRepo from '../../repositories/admin/platformAuditRepository';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '100'), 10) || 100));
    const rows = await auditRepo.listPlatformAudit(limit);
    const action = req.query.action ? String(req.query.action) : null;
    const data = action ? rows.filter((r) => r.action.includes(action)) : rows;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
