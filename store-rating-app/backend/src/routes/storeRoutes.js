const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listStores, submitRating } = require('../controllers/storeController');

router.use(authenticate, authorize('user'));

router.get('/', listStores);
router.post('/:id/rating', submitRating);

module.exports = router;
