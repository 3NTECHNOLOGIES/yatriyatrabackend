import express from 'express';
import authRoute from './auth.route';
import homeRoute from './home.route';
import categoryRoute from './category.route';
import blogRoute from './blog.route';
import userRoute from './user.route';
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
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/blogs',
    route: blogRoute,
  },
  {
    path: '/users',
    route: userRoute,
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
