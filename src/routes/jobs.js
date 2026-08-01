const express = require('express');
const jobController = require('../controllers/jobController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { idParams, paginationQuery } = require('../validators/schemas/commonSchemas');

const router = express.Router();

router.get('/', validateRequest(paginationQuery, 'query'), asyncHandler(jobController.list));
router.get('/:id', validateRequest(idParams, 'params'), asyncHandler(jobController.getById));

module.exports = router;
