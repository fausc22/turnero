import { Router } from 'express';
import { getAsset } from '../../controllers/public/assetsController';

const router = Router();

router.get('/:type', getAsset);

export default router;
