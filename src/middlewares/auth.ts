import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { IUserDocument } from '../interfaces/user.interface';

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: IUserDocument;
  }
}

const verifyCallback =
  (req: Request, resolve: any, reject: any, requiredRights: string[]) =>
  async (err: Error, user: IUserDocument, info: string) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = [user.role];
      const hasRequiredRights = requiredRights.every(requiredRight =>
        userRights.includes(requiredRight as any),
      );
      if (!hasRequiredRights) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate(
        'jwt',
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights),
      )(req, res, next);
    })
      .then(() => next())
      .catch(err => next(err));
  };

export default auth;
