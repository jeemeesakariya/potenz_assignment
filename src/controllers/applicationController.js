const applicationService = require('../services/applicationService');

async function submit(req, res) {
  const application = await applicationService.submit(req.user, req.body);
  res.status(201).json({ message: 'Application submitted successfully', application });
}

async function list(req, res) {
  const { applications, pagination } = await applicationService.listForCandidate(req.user.id, req.query);
  res.json({ count: applications.length, applications, pagination });
}

async function getById(req, res) {
  const application = await applicationService.getForCandidate(req.params.id, req.user.id);
  res.json({ application });
}

module.exports = { submit, list, getById };
