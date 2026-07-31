const mongoose = require('mongoose');
const config = require('./config');
const Job = require('./models/Job');
const sampleJobs = require('./sampleJobs');

async function seed() {
  await mongoose.connect(config.mongoUri);
  for (const job of sampleJobs) {
    await Job.findOneAndUpdate(
      { title: job.title, company: job.company },
      { $setOnInsert: job },
      { upsert: true, new: true }
    );
  }
  console.log(`${sampleJobs.length} sample jobs are available.`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
