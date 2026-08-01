const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const openApiDocument = require('./docs/openapi');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resumes');
const applicationRoutes = require('./routes/applications');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((item) => item.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => res.json({
  name: 'Job Application Portal API',
  documentation: '/api-docs',
  health: '/health',
}));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', database: ready ? 'connected' : 'disconnected' });
});
app.get('/api-docs.json', (_req, res) => res.json(openApiDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'Job Portal API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Request body contains invalid JSON' });
  }
  if (error.statusCode) {
    const response = { error: error.message };
    if (error.details) response.details = error.details;
    return res.status(error.statusCode).json(response);
  }
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Resume exceeds the configured size limit' : error.message;
    return res.status(400).json({ error: message });
  }
  if (error.message === 'Resume must be a PDF, DOC, or DOCX file') {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
    return res.status(400).json({ error: 'Database validation failed', details });
  }
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
