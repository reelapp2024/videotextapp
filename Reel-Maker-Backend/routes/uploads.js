const express = require('express');
const router = express.Router();
const { generalUpload } = require('../middleware/upload');
const uploadsController = require('../controllers/uploadsController');

router.post('/video', generalUpload.single('file'), uploadsController.uploadVideo);
router.post('/audio', generalUpload.single('file'), uploadsController.uploadAudio);
router.post('/file', generalUpload.single('file'), uploadsController.uploadFile);

module.exports = router;
