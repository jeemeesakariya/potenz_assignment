const path = require('path');
require('dotenv').config();

const rootDir = path.resolve(__dirname, '..');

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: positiveNumber(process.env.PORT, 3000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_application_portal',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me-123456',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  maxResumeSize: positiveNumber(process.env.MAX_RESUME_SIZE_MB, 5) * 1024 * 1024,
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'uploads/resumes'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
