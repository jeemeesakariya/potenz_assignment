const mongoose = require('mongoose');
const config = require('./config');
const Job = require('./models/Job');
const sampleJobs = require('./sampleJobs');

async function seed() {
  await mongoose.connect(config.mongoUri);
  try {
    const operations = sampleJobs.map((job) => ({
      updateOne: {
        filter: { seedKey: job.seedKey },
        update: { $set: job },
        upsert: true,
      },
    }));
    const result = await Job.bulkWrite(operations, { ordered: false });
    console.log(`${sampleJobs.length} demo jobs synchronized (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
