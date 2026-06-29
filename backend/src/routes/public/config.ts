import { Router } from 'express';
import { getConfig } from '../../controllers/public/publicConfigController';

const router = Router();

router.get('/', getConfig);

export default router;
