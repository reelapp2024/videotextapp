const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userPresetsController = require('../controllers/userPresetsController');

router.get('/', authMiddleware(false), userPresetsController.list);
router.post('/', authMiddleware(false), userPresetsController.createOrUpsert);
router.put('/:id', authMiddleware(false), userPresetsController.update);
router.delete('/:id', authMiddleware(false), userPresetsController.remove);

module.exports = router;
