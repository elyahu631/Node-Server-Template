// routes/userRoutes.ts

import express from 'express';
import {
  getMe,
  getUser,
  updateMe,
  deleteUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteMe,
} from '../controllers/user.controller';
import {
  signupController,
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  updatePasswordController,
  protect,
  restrictTo,
} from '../controllers/auth.controller';
import {
  registerValidationSchema,
  updateUserValidationSchema,
  changePasswordValidationSchema,
} from '../validations/userValidations';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// Routes for user signup, login, logout, password reset, and update
router.post('/signup', validateRequest(registerValidationSchema), signupController);
router.post('/login', loginController);
router.get('/logout', logoutController);
router.post('/forgotPassword', forgotPasswordController);
router.patch('/resetPassword/:token', resetPasswordController);

router.use(protect);

// Routes for updating user's password and managing user's own profile
router.patch('/updateMyPassword', validateRequest(changePasswordValidationSchema), updatePasswordController);
router.get('/me', getMe, getUser);
router.patch('/updateMe', validateRequest(updateUserValidationSchema), updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

// Routes for managing all users
router.route('/')
  .get(getAllUsers)
  .post(createUser);// todo --> create the logic here

// Routes for getting, updating, and deleting a specific user by ID
router.route('/:id')
  .get(getUser)
  .patch(validateRequest(updateUserValidationSchema), updateUser)
  .delete(deleteUser);

export default router;
