import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { createListaEsperaSchema } from '../../validations/public/listaEspera';
import * as listaEsperaController from '../../controllers/public/listaEsperaController';

const router = Router();

router.post('/', validate(createListaEsperaSchema), listaEsperaController.create);

export default router;
