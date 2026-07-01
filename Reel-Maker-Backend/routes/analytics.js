const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.post('/', authMiddleware(true), analyticsController.track);

module.exports = router;
