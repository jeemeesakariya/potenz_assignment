const Job = require('../models/Job');

const findActive = ({ skip, limit }) => Job.find({ isActive: true })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
const countActive = () => Job.countDocuments({ isActive: true });
const findActiveById = (id) => Job.findOne({ _id: id, isActive: true }).lean();

module.exports = { findActive, countActive, findActiveById };
