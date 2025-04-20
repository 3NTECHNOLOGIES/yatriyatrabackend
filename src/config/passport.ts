import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { Request } from 'express';
import config from './config';
import { getUserById } from '../services/user.service';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: any, done: VerifiedCallback) => {
  try {
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    const user = await getUserById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
