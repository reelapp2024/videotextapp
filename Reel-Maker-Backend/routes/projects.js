const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const projectsController = require('../controllers/projectsController');

router.get('/', authMiddleware(true), projectsController.list);
router.get('/:id', projectsController.getById);
router.post('/', authMiddleware(true), projectsController.create);
router.put('/:id', authMiddleware(true), projectsController.update);
router.delete('/:id', authMiddleware(true), projectsController.remove);

module.exports = router;
