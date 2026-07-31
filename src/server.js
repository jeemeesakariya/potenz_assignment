const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

async function start() {
  if (config.nodeEnv === 'production') {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be configured in production');
    if (!process.env.JWT_SECRET || config.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters in production');
    }
  }
  await mongoose.connect(config.mongoUri);
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`API listening on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down gracefully`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
