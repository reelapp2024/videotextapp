const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const videoController = require('../controllers/videoController');

router.post('/process', authMiddleware(true), videoController.process);
router.post('/slideshow', authMiddleware(true), videoController.slideshow);
router.post('/job/:id/cancel', authMiddleware(true), videoController.cancelJob);
router.get('/job/:id', videoController.getJobStatus);

module.exports = router;
