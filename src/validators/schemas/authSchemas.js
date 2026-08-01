const Joi = require('joi');

const email = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).messages({
  'string.empty': 'email is required',
  'string.email': 'email must be a valid email address',
  'string.max': 'email cannot exceed 254 characters',
});

const password = Joi.string().min(8).max(72).messages({
  'string.empty': 'password is required',
  'string.min': 'password must contain at least 8 characters',
  'string.max': 'password cannot exceed 72 characters',
});

const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'name is required',
    'string.min': 'name must contain at least 2 characters',
    'string.max': 'name cannot exceed 100 characters',
  }),
  email: email.required(),
  password: password.required(),
});

const login = Joi.object({ email: email.required(), password: password.required() });

module.exports = { register, login };
