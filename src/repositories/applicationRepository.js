const Application = require('../models/Application');

const create = (application) => Application.create(application);
const findByCandidate = (candidateId, { skip, limit }) => Application.find({ candidate: candidateId })
  .populate('job')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
const countByCandidate = (candidateId) => Application.countDocuments({ candidate: candidateId });
const findByIdAndCandidate = (id, candidateId) => Application
  .findOne({ _id: id, candidate: candidateId })
  .populate('job');
const populateJob = (application) => application.populate('job');

module.exports = { create, findByCandidate, countByCandidate, findByIdAndCandidate, populateJob };
