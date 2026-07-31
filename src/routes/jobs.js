const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid job ID' });
    const job = await Job.findOne({ _id: req.params.id, isActive: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
