// controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import { getOne, getAll, updateOne, deleteOne } from '../services/factoryService';
import { deactivateUser, updateUserDetails } from '../services/userService';

const userModel = 'User';

interface CustomRequest extends Request {
  user?: any; 
}

export const getMe = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.user) {
    req.params.id = req.user.id;
  }
  next();
};

export const updateMe = catchAsync(async (req: CustomRequest, res: Response) => {
  if (req.user) {
    const updatedUser = await updateUserDetails(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
});

// Deactivate (soft delete) the current user
export const deleteMe = catchAsync(async (req: CustomRequest, res: Response) => {
  if (req.user) {
    await deactivateUser(req.user.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
});

export const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

export const getUser = getOne(userModel);
export const getAllUsers = getAll(userModel);
export const updateUser = updateOne(userModel);
export const deleteUser = deleteOne(userModel);
