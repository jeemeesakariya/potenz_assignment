const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');

const router = express.Router();
router.use(auth);

router.post('/', async (req, res, next) => {
  try {
    const { jobId, coverLetter = '' } = req.body;
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ error: 'A valid jobId is required' });
    if (!req.user.resume) return res.status(400).json({ error: 'Upload a resume before applying' });
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) return res.status(404).json({ error: 'Job not found or no longer active' });

    const application = await Application.create({
      candidate: req.user.id,
      job: job.id,
      coverLetter,
      resumeSnapshot: req.user.resume.toObject ? req.user.resume.toObject() : req.user.resume,
    });
    await application.populate('job');
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'You have already applied for this job' });
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json({ count: applications.length, applications });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid application ID' });
    const application = await Application.findOne({ _id: req.params.id, candidate: req.user.id }).populate('job');
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ application });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
