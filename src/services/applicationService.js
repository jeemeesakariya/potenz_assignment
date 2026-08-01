const mongoose = require('mongoose');
const applicationRepository = require('../repositories/applicationRepository');
const jobRepository = require('../repositories/jobRepository');
const AppError = require('../utils/AppError');
const { pagination, metadata } = require('../utils/pagination');

async function submit(user, { jobId, coverLetter = '' }) {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError(400, 'A valid jobId is required');
  if (!user.resume) throw new AppError(400, 'Upload a resume before applying');
  const job = await jobRepository.findActiveById(jobId);
  if (!job) throw new AppError(404, 'Job not found or no longer active');
  try {
    const application = await applicationRepository.create({
      candidate: user.id,
      job: job.id,
      coverLetter,
      resumeSnapshot: user.resume.toObject ? user.resume.toObject() : user.resume,
    });
    return applicationRepository.populateJob(application);
  } catch (error) {
    if (error.code === 11000) throw new AppError(409, 'You have already applied for this job');
    throw error;
  }
}

async function listForCandidate(candidateId, query) {
  const paging = pagination(query);
  const [applications, total] = await Promise.all([
    applicationRepository.findByCandidate(candidateId, paging),
    applicationRepository.countByCandidate(candidateId),
  ]);
  return { applications, pagination: metadata(total, paging.page, paging.limit) };
}

async function getForCandidate(id, candidateId) {
  if (!mongoose.isValidObjectId(id)) throw new AppError(400, 'Invalid application ID');
  const application = await applicationRepository.findByIdAndCandidate(id, candidateId);
  if (!application) throw new AppError(404, 'Application not found');
  return application;
}

module.exports = { submit, listForCandidate, getForCandidate };
