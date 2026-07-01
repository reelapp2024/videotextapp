const express = require('express');
const router = express.Router();
const backgroundEffectsController = require('../controllers/backgroundEffectsController');

router.get('/catalog', backgroundEffectsController.getCatalog);
router.get('/:id', backgroundEffectsController.getById);

module.exports = router;
