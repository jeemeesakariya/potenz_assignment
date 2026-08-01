const express = require('express');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middleware/validateRequest');
const authSchemas = require('../validators/schemas/authSchemas');

const router = express.Router();
router.post('/register', validateRequest(authSchemas.register), asyncHandler(authController.register));
router.post('/login', validateRequest(authSchemas.login), asyncHandler(authController.login));
router.get('/me', auth, authController.me);

module.exports = router;
