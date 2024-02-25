// validations/userValidations.ts

import { z } from 'zod';

const registerValidationSchema = z.object({
  name: z.string().min(1, 'Please tell us your name!'),
  email: z.string().email('Please provide a valid email'),
  role: z.enum(['user', 'admin']).default('user'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

const changePasswordValidationSchema = z.object({
  passwordCurrent: z.string(),
  password: z.string().min(8, 'New password must be at least 8 characters'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});


const updateUserValidationSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export {
  registerValidationSchema,
  updateUserValidationSchema,
  changePasswordValidationSchema,
};
