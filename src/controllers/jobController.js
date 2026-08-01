const jobService = require('../services/jobService');

async function list(req, res) {
  const { jobs, pagination } = await jobService.list(req.query);
  res.json({ count: jobs.length, jobs, pagination });
}

async function getById(req, res) {
  res.json({ job: await jobService.getById(req.params.id) });
}

module.exports = { list, getById };
