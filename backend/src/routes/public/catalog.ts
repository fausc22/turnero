import { Router } from 'express';
import {
  getServicios,
  getProductos,
  getProfesionales,
} from '../../controllers/public/publicCatalogController';

const router = Router();

router.get('/servicios', getServicios);
router.get('/productos', getProductos);
router.get('/profesionales', getProfesionales);

export default router;
