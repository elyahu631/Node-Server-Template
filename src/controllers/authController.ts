// controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import {
  authenticate,
  optionallyAuthenticate,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateUserPassword
} from '../services/authService';

interface CustomRequest extends Request {
  user?: any;
}

export const protect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = await authenticate(req, next);
  req.user = user;
  next();
});


export const conditionalProtect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = await optionallyAuthenticate(req);
  req.user = user;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export const signupController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await signup(req.body, res);
});

export const loginController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await login(req.body.email, req.body.password, next, res);
});

export const logoutController = (req: Request, res: Response) => {
  logout(res);
};

export const forgotPasswordController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await forgotPassword(req.body.email, req, next);
  res.status(200).json(result);
});

export const resetPasswordController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  await resetPassword(token, password, passwordConfirm, res, next);
});

export const updatePasswordController = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;
  await updateUserPassword(req.user.id, passwordCurrent, password, passwordConfirm, res);
});
