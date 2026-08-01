const express = require('express');
const jobController = require('../controllers/jobController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(jobController.list));
router.get('/:id', asyncHandler(jobController.getById));

module.exports = router;
