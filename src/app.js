const express = require('express');
const multer = require('multer');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resumes');
const applicationRoutes = require('./routes/applications');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Resume exceeds the configured size limit' : error.message;
    return res.status(400).json({ error: message });
  }
  if (error.message === 'Resume must be a PDF, DOC, or DOCX file') {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
