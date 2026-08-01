const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');

const router = express.Router();

router.post('/', auth, upload.single('resume'), resumeController.upload);
router.get('/download', auth, resumeController.download);

module.exports = router;
