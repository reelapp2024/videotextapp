const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/users', ...adminMiddleware(), adminController.listUsers);
router.post('/users', ...adminMiddleware(), adminController.createUser);
router.put('/users/:id', ...adminMiddleware(), adminController.updateUser);
router.delete('/users/:id', ...adminMiddleware(), adminController.deleteUser);
router.get('/stats', ...adminMiddleware(), adminController.getStats);

module.exports = router;
