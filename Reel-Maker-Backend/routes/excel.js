const express = require('express');
const router = express.Router();
const { excelUpload } = require('../middleware/upload');
const excelController = require('../controllers/excelController');

router.post('/parse', excelUpload.single('file'), excelController.parse);

module.exports = router;
