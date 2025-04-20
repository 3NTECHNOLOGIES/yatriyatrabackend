import httpStatus from 'http-status';
import Token from '../models/token.model';
import ApiError from '../utils/ApiError';
import { TokenType } from '../interfaces/token.interface';
import { getUserByEmail } from './user.service';
import { generateAuthTokens, verifyToken } from './token.service';
import Session from '../models/session.model';
import User from '../models/user.model';

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<IUserWithTokens>}
 */
export const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: 'refresh',
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }

  // Remove session
  await Session.findOneAndDelete({
    token: refreshToken,
    userId: refreshTokenDoc.user,
  });

  // Blacklist token
  await Token.findOneAndUpdate({ token: refreshToken, type: 'refresh' }, { blacklisted: true });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, 'refresh');
    const user = await User.findById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.findOneAndDelete({ token: refreshToken, type: 'refresh' });
    return generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const register = async (userBody: any) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};
