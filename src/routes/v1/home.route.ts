import { Router } from 'express';
import { getHome } from '../../controllers/home.controller';
import auth from '../../middlewares/auth';

const router = Router();

router.get('/home', auth(), getHome);

export default router;
