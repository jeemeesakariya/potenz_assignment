const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');
const validateResume = require('../middleware/validateResume');

const router = express.Router();

router.post('/', auth, upload.single('resume'), validateResume, resumeController.upload);
router.get('/download', auth, resumeController.download);

module.exports = router;
