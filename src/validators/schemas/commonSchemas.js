const Joi = require("joi");

const objectId = Joi.string()
  .trim()
  .pattern(/^[a-f\d]{24}$/i)
  .messages({
    "string.empty": "{{#label}} is required",
    "string.pattern.base": "{{#label}} must be a valid MongoDB ID",
  });

const idParams = Joi.object({ id: objectId.required() });

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "page must be a number",
    "number.integer": "page must be a whole number",
    "number.min": "page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "limit must be a number",
    "number.integer": "limit must be a whole number",
    "number.min": "limit must be at least 1",
    "number.max": "limit cannot exceed 100",
  }),
});

module.exports = { idParams, objectId, paginationQuery };
