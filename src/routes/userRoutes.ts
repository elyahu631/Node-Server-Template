// routes/userRoutes.ts
/**
 * @file userRoutes.ts
 * Defines routes for user-related operations including authentication, profile management, and administrative actions.
 */

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

/**
 * Registers a new user.
 * @route POST /signup
 * @param {express.Request} req - Express request object, expects user registration details.
 * @param {express.Response} res - Express response object.
 */
router.post('/signup', validateRequest(registerValidationSchema), signupController);

/**
 * Authenticates a user and initiates a session.
 * @route POST /login
 * @param {express.Request} req - Express request object, expects login credentials.
 * @param {express.Response} res - Express response object.
 */
router.post('/login', loginController);

/**
 * Logs out a user and ends the session.
 * @route GET /logout
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 */
router.get('/logout', logoutController);

/**
 * Initiates the password reset process for a user.
 * @route POST /forgotPassword
 * @param {express.Request} req - Express request object, expects email address.
 * @param {express.Response} res - Express response object.
 */
router.post('/forgotPassword', forgotPasswordController);

/**
 * Allows a user to reset their password using a reset token.
 * @route PATCH /resetPassword/:token
 * @param {express.Request} req - Express request object, expects password reset token and new password.
 * @param {express.Response} res - Express response object.
 */
router.patch('/resetPassword/:token', resetPasswordController);

router.use(protect);

/**
 * Allows a logged-in user to update their password.
 * @route PATCH /updateMyPassword
 * @param {express.Request} req - Express request object, expects current and new passwords.
 * @param {express.Response} res - Express response object.
 */
router.patch('/updateMyPassword', validateRequest(changePasswordValidationSchema), updatePasswordController);

/**
 * Retrieves the profile information of the currently logged-in user.
 * @route GET /me
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 */
router.get('/me', getMe, getUser);

/**
 * Allows a logged-in user to update their profile information.
 * @route PATCH /updateMe
 * @param {express.Request} req - Express request object, expects user profile details.
 * @param {express.Response} res - Express response object.
 */
router.patch('/updateMe', validateRequest(updateUserValidationSchema), updateMe);

/**
 * Allows a logged-in user to delete their account.
 * @route DELETE /deleteMe
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 */
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

/**
 * Retrieves a list of all users. Restricted to admin users.
 * @route GET /
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 */
router.get('/', getAllUsers);

/**
 * Allows admin to create a new user.
 * @route POST /
 * @param {express.Request} req - Express request object, expects user details.
 * @param {express.Response} res - Express response object.
 */
router.post('/', validateRequest(registerValidationSchema), createUser);

/**
 * Retrieves, updates, or deletes a specific user by ID. Restricted to admin users.
 * @route GET /:id
 * @route PATCH /:id
 * @route DELETE /:id
 * @param {express.Request} req - Express request object, includes user ID in the URL.
 * @param {express.Response} res - Express response object.
 */
router.route('/:id')
  .get(getUser)
  .patch(validateRequest(updateUserValidationSchema), updateUser)
  .delete(deleteUser);

export default router;
