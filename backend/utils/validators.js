const Joi = require('joi');

const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'User').optional()
});

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const customerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow('')
});

const leadValidator = Joi.object({
  customerId: Joi.string().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().optional().allow(''),
  status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').optional(),
  value: Joi.number().min(0).optional()
});

module.exports = {
  registerValidator,
  loginValidator,
  customerValidator,
  leadValidator
};