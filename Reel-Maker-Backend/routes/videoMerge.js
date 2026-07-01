const express = require('express');
const router = express.Router();
const videoMergeController = require('../controllers/videoMergeController');

router.post('/', videoMergeController.merge);

module.exports = router;
