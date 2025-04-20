import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import httpStatus from 'http-status';
import config from '../config/config';
import Token from '../models/token.model';
import ApiError from '../utils/ApiError';
import { IUserDocument } from '../interfaces/user.interface';
import { TokenType } from '../interfaces/token.interface';
import Session from '../models/session.model';

/**
 * Generate token
 * @param {string} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
  userId: string,
  expires: Moment,
  type: TokenType,
  secret: string = config.jwt.secret,
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {string} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted=false]
 * @returns {Promise<ITokenDocument>}
 */
const saveToken = async (
  token: string,
  userId: string,
  expires: Moment,
  type: TokenType,
  blacklisted = false,
) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type: TokenType) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await Token.findOne({
      token,
      type,
      user: payload.sub,
      blacklisted: false,
    });
    if (!tokenDoc) {
      throw new Error('Token not found');
    }
    return tokenDoc;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }
};

/**
 * Generate auth tokens for a user
 * @param {IUserDocument} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user: IUserDocument) => {
  const userId = user.id;

  // Access token expiration
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(userId, accessTokenExpires, 'access');

  // Refresh token expiration
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(userId, refreshTokenExpires, 'refresh');

  // Save refresh token to database
  await saveToken(refreshToken, userId, refreshTokenExpires, 'refresh');

  // Create and save user session (for the 2 device limit)
  const session = await Session.create({
    userId,
    token: refreshToken,
    expires: refreshTokenExpires.toDate(),
    createdAt: new Date(),
  });

  // Check if user has more than 2 active sessions
  const sessions = await Session.find({ userId }).sort({ createdAt: 1 });
  if (sessions.length > 2) {
    // Remove oldest session
    const oldestSession = sessions[0];
    await Session.findByIdAndDelete(oldestSession._id);

    // Blacklist the token associated with the oldest session
    await Token.findOneAndUpdate(
      { token: oldestSession.token, user: userId, type: 'refresh' },
      { blacklisted: true },
    );
  }

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email: string) => {
  // Implementation omitted for brevity
  return 'reset-token';
};

/**
 * Generate verify email token
 * @param {IUserDocument} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user: IUserDocument) => {
  // Implementation omitted for brevity
  return 'verify-token';
};

export {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
