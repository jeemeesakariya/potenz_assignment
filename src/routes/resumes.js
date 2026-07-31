const express = require('express');
const fs = require('fs/promises');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', auth, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'A resume file is required in the resume field' });
    const oldPath = req.user.resume?.path;
    req.user.resume = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };
    await req.user.save();
    if (oldPath && oldPath !== req.file.path) await fs.unlink(oldPath).catch(() => {});
    res.status(201).json({ message: 'Resume uploaded successfully', resume: req.user.resume });
  } catch (error) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
});

router.get('/download', auth, (req, res) => {
  if (!req.user.resume) return res.status(404).json({ error: 'No resume uploaded' });
  res.download(req.user.resume.path, req.user.resume.originalName, (error) => {
    if (error && !res.headersSent) res.status(404).json({ error: 'Resume file not found' });
  });
});

module.exports = router;
