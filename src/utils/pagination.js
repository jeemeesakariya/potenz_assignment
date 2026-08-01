const AppError = require('./AppError');

function pagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  if (!Number.isInteger(page) || page < 1) throw new AppError(400, 'page must be a positive integer');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError(400, 'limit must be an integer between 1 and 100');
  }
  return { page, limit, skip: (page - 1) * limit };
}

function metadata(total, page, limit) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { pagination, metadata };
