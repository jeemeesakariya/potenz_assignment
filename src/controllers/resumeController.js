const resumeService = require('../services/resumeService');

async function upload(req, res, next) {
  try {
    const resume = await resumeService.upload(req.user, req.file);
    res.status(201).json({ message: 'Resume uploaded successfully', resume });
  } catch (error) {
    await resumeService.removeUploadedFile(req.file);
    next(error);
  }
}

function download(req, res) {
  if (!req.user.resume) return res.status(404).json({ error: 'No resume uploaded' });
  res.download(req.user.resume.path, req.user.resume.originalName, (error) => {
    if (error && !res.headersSent) res.status(404).json({ error: 'Resume file not found' });
  });
}

module.exports = { upload, download };
