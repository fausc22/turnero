import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { tenantAuthService } from '../../services/tenantAuthService';

const router = Router();
const gerente = requireTenantRole('GERENTE');

router.use(authenticateTenant, requireTenantMatch);

router.post('/complete', gerente, async (req, res, next) => {
  try {
    const data = await tenantAuthService.completeOnboarding(req.tenantUser!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
