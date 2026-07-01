const express = require('express');
const router = express.Router();
const audioExtractController = require('../controllers/audioExtractController');

router.post('/', audioExtractController.extract);

module.exports = router;
