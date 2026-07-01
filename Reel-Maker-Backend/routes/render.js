const express = require('express');
const { renderFrame, renderParityScenario } = require('../controllers/renderController');

const router = express.Router();

router.post('/frame', renderFrame);
router.get('/parity/:scenario', renderParityScenario);

module.exports = router;
