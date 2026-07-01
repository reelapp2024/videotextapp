const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');

router.get('/voices', ttsController.listVoices);
router.post('/', ttsController.generate);

module.exports = router;
