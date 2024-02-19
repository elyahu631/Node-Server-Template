// validations/userValidations.ts

import Joi from 'joi';

const registerValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'string.empty': 'Please tell us your name!', 
      'any.required': 'Name is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email', 
      'any.required': 'Email is required',
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either user or admin',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters', 
      'any.required': 'Password is required',
    }),
  passwordConfirm: Joi.any()
    .equal(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match', 
      'any.required': 'Password confirmation is required',
    }),
}).with('password', 'passwordConfirm');

const updateUserValidationSchema = Joi.object({
  name: Joi.string().optional().messages({
    'string.empty': 'Please tell us your name!',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email',
  }),
}).min(1);

const changePasswordValidationSchema = Joi.object({
  passwordCurrent: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'New password must be at least 8 characters',
    'any.required': 'New password is required',
  }),
  passwordConfirm: Joi.any().equal(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required',
  }),
});

export {
  registerValidationSchema,
  updateUserValidationSchema,
  changePasswordValidationSchema,
};
