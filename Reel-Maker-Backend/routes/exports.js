const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const exportsController = require('../controllers/exportsController');

router.post('/', authMiddleware(true), exportsController.create);
router.get('/', authMiddleware(true), exportsController.list);

module.exports = router;
