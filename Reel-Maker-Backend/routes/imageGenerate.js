const express = require('express');
const router = express.Router();
const imageGenerateController = require('../controllers/imageGenerateController');

router.post('/', imageGenerateController.generate);

module.exports = router;
