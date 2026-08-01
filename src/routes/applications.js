const express = require('express');
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(auth);

router.post('/', asyncHandler(applicationController.submit));
router.get('/', asyncHandler(applicationController.list));
router.get('/:id', asyncHandler(applicationController.getById));

module.exports = router;
