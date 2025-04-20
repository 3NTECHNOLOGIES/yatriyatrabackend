import express from 'express';
import authRoute from './auth.route';
import homeRoute from './home.route';
import auth from '../../middlewares/auth';

const router = express.Router();

interface IRoute {
  path: string;
  route: express.Router;
}

const defaultRoutes: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/',
    route: homeRoute,
  },
];

// Home route with auth protection
router.get('/home', auth(), (req, res) => {
  res.json({ message: 'Welcome to the protected home route!' });
});

// Register all routes
defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

export default router;
