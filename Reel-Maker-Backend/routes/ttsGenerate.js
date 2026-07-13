const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');
const { cloneUpload } = require('../middleware/upload');

router.get('/voices', ttsController.listVoices);
router.get('/advanced/voices', ttsController.listAdvancedVoices);
router.get('/advanced/status', ttsController.advancedStatus);
router.post('/advanced/clone', cloneUpload.single('audio'), ttsController.uploadAdvancedClone);
router.post('/advanced/preview', ttsController.advancedPreview);
router.post('/advanced', ttsController.advancedGenerate);
router.post('/preview', ttsController.preview);
router.post('/', ttsController.generate);

module.exports = router;
