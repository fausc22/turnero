import { Router } from 'express';
import multer from 'multer';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import * as mediaController from '../../controllers/tenant/mediaController';

const router = Router();
const gerente = requireTenantRole('GERENTE');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authenticateTenant, requireTenantMatch);

router.post('/upload', gerente, upload.single('file') as never, mediaController.upload);
router.get('/:type', gerente, mediaController.getMedia);

export default router;
