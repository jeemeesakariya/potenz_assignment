const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

async function start() {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
