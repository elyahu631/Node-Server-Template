// services/userService.js

import DataAccess from '../dataBase/dataAccess';
import AppError from '../utils/appError';
import { filterObj } from '../services/helperService';

interface UserUpdateBody {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  [key: string]: any; 
}

// update user details, excluding password updates.
export const updateUserDetails = async (userId: string, body: UserUpdateBody) => {
  
  // 1) Check for password fields to avoid updates through this route
  if (body.password || body.passwordConfirm) {
    throw new AppError('This route is not for password updates. Please use /updateMyPassword.', 400);
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(body, 'name', 'email');

  // 3) Perform the update
  const updatedUser = await DataAccess.updateById('User', userId, filteredBody);
  if (!updatedUser) {
    throw new AppError('No user found with that ID', 404);
  }

  return updatedUser;
};

// A function to deactivate a user.
export const deactivateUser = async (userId: string) => {
  const updatedUser = await DataAccess.updateById('User', userId, { active: false });
  if (!updatedUser) {
    throw new AppError('No user found with that ID', 404);
  }
  return updatedUser;
};
