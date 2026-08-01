const mongoose = require('mongoose');
const jobRepository = require('../repositories/jobRepository');
const AppError = require('../utils/AppError');
const { pagination, metadata } = require('../utils/pagination');

async function list(query) {
  const paging = pagination(query);
  const [jobs, total] = await Promise.all([
    jobRepository.findActive(paging),
    jobRepository.countActive(),
  ]);
  return { jobs, pagination: metadata(total, paging.page, paging.limit) };
}

async function getById(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid job ID');
  const job = await jobRepository.findActiveById(id);
  if (!job) throw new AppError(404, 'Job not found');
  return job;
}

module.exports = { list, getById };
