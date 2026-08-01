const express = require('express');
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const { idParams, paginationQuery } = require('../validators/schemas/commonSchemas');
const applicationSchemas = require('../validators/schemas/applicationSchemas');

const router = express.Router();
router.use(auth);

router.post('/', validateRequest(applicationSchemas.submit), asyncHandler(applicationController.submit));
router.get('/', validateRequest(paginationQuery, 'query'), asyncHandler(applicationController.list));
router.get('/:id', validateRequest(idParams, 'params'), asyncHandler(applicationController.getById));

module.exports = router;
