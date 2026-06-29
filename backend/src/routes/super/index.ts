import { Router, Request, Response } from 'express';
import { authenticateSuper } from '../../middlewares/superAuth';
import authRoutes from './auth';
import tenantRoutes from './tenants';
import auditRoutes from './audit';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, scope: 'super', phase: 8 });
});

router.use('/auth', authRoutes);
router.use(authenticateSuper);
router.use('/tenants', tenantRoutes);
router.use('/audit', auditRoutes);

export default router;
