import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { loginUserWithEmailAndPassword, refreshAuth, logout } from '../services/auth.service';
import { generateAuthTokens } from '../services/token.service';
import { createUser } from '../services/user.service';
import { sendResponse } from '../utils/response';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    const tokens = await generateAuthTokens(user);
    sendResponse(res, httpStatus.CREATED, 'User registered successfully', { user, tokens });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.BAD_REQUEST, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await loginUserWithEmailAndPassword(email, password);
    const tokens = await generateAuthTokens(user);
    sendResponse(res, httpStatus.OK, 'Login successful', { user, tokens });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.UNAUTHORIZED, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const tokens = await refreshAuth(req.body.refreshToken);
    sendResponse(res, httpStatus.OK, 'Tokens refreshed successfully', { tokens });
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.UNAUTHORIZED, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    await logout(req.body.refreshToken);
    sendResponse(res, httpStatus.OK, 'Logout successful');
  } catch (error) {
    if (error instanceof Error) {
      sendResponse(res, httpStatus.NOT_FOUND, error.message);
    } else {
      sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
    }
  }
};
