// services/authService.ts

import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import DataAccess from '../utils/dataBase/dataAccess';
import sendEmail from '../config/email';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/user.interface';
import { vars } from '../config/vars';

const { jwtSecret, jwtExpiresIn, jwtCookieExpiresIn, nodeEnv } = vars;

interface DecodedToken {
  id: string;
  iat?: number;
}

const userModel = 'User';

const signToken = (id: string): string => jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });

const createTokenSendResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());
  const cookieOptions = {
    expires: new Date(Date.now() + jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: nodeEnv === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  const userForResponse: Partial<IUser> = { ...user.toObject(), password: undefined };

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user: userForResponse },
  });
};

const extractToken = (req: Request): string | null => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    return req.cookies.jwt;
  }
  return null;
};

const verifyToken = async (token: string): Promise<DecodedToken | null> => {
  try {
    return await jwt.verify(token, jwtSecret) as DecodedToken;
  } catch (error) {
    return null;
  }
};

const getUserAndCheck = async (decoded: DecodedToken, next: NextFunction): Promise<IUser | null> => {
  if (!decoded) {
    throw new AppError('Invalid token or token expired', 401);
  }

  const currentUser = await DataAccess.findById<IUser>(userModel, decoded.id);

  if (!currentUser) {
    throw new AppError('The user belonging to this token does no longer exist.', 401);
  }

  if (currentUser.changedPasswordAfter && decoded.iat !== undefined && currentUser.changedPasswordAfter(decoded.iat)) {
    throw new AppError('User recently changed password! Please log in again.', 401);
  }

  return currentUser;
};

export const authenticate = async (req: Request, next: NextFunction): Promise<IUser | null | void> => {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return next(new AppError('Invalid token or token expired', 401));
  }

  return await getUserAndCheck(decoded, next);
};

export const optionallyAuthenticate = async (req: Request): Promise<IUser | null> => {
  const token = extractToken(req);
  if (token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      return await DataAccess.findById<IUser>(userModel, decoded.id);
    }
  }
  return null; // Return null if no token or token is invalid
};

export const signup = async (userData: Partial<IUser>, res: Response): Promise<void> => {
  const newUser = await DataAccess.create<IUser>(userModel, userData);
  createTokenSendResponse(newUser, 201, res);
};

export const login = async (
  email: string,
  password: string,
  next: NextFunction,
  res: Response
): Promise<void> => {
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await DataAccess.findOneByConditions<IUser>(userModel, { email }, '+password');
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createTokenSendResponse(user, 200, res);
};

export const logout = (res: Response): Response => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: nodeEnv === 'production',
  });
  return res.status(200).json({ status: 'success' });
};

export const forgotPassword = async (
  email: string,
  req: Request,
  next: NextFunction
): Promise<{ status: string; message: string } | void> => {

  const user = await DataAccess.findOneByConditions<IUser>(userModel, { email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await DataAccess.saveDocument(user, { validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    return {
      status: 'success',
      message: 'Token sent to email!',
    };
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await DataAccess.saveDocument(user, { validateBeforeSave: false });
    throw new AppError('There was an error sending the email. Try again later!', 500);
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  newPasswordConfirm: string,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await DataAccess.findOneByConditions<IUser>(userModel, {
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await DataAccess.saveDocument(user);

  createTokenSendResponse(user, 200, res);
};

export const updateUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
  res: Response,
): Promise<void> => {

  const user = await DataAccess.findOneByConditions<IUser>(userModel, { _id: userId }, '+password');

  if (!user || !(await user.correctPassword(currentPassword))) {
    throw new AppError('Your current password is wrong.', 401);
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await DataAccess.saveDocument(user);

  createTokenSendResponse(user, 200, res);
};

