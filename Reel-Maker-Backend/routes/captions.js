const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const captionsController = require('../controllers/captionsController');

router.post('/batch', authMiddleware(true), captionsController.createBatch);
router.get('/job/:jobId', authMiddleware(true), captionsController.getJob);
router.patch('/tracks/:trackId', authMiddleware(true), captionsController.updateTrack);
router.post('/job/:jobId/style', authMiddleware(true), captionsController.setStyle);
router.post('/job/:jobId/render', authMiddleware(true), captionsController.render);
router.get('/templates', authMiddleware(true), captionsController.listTemplates);

module.exports = router;
