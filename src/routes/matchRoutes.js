const express = require('express');
const PairController = require('../controllers/pairController');
const router = express.Router();

router.post('/api/matches',PairController.makePair);
router.put('/api/matches',PairController.updatePair);

router.get('/api/matches',PairController.getMatches);
router.delete('/api/matches/:id',PairController.cancelDate);

module.exports = router;
