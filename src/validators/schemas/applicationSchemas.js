const Joi = require('joi');
const { objectId } = require('./commonSchemas');

const submit = Joi.object({
  jobId: objectId.required().messages({
    'any.required': 'jobId is required',
    'string.empty': 'jobId is required',
    'string.pattern.base': 'jobId must be a valid MongoDB ID',
  }),
  coverLetter: Joi.string().trim().allow('').max(3000).default('').messages({
    'string.base': 'coverLetter must be text',
    'string.max': 'coverLetter cannot exceed 3000 characters',
  }),
});

module.exports = { submit };
