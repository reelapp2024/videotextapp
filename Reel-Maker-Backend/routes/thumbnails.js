const express = require('express');
const router = express.Router();
const thumbnailsController = require('../controllers/thumbnailsController');

router.post('/', thumbnailsController.extract);

module.exports = router;
