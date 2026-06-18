const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/storeOwnerController');

router.use(authenticate, authorize('store_owner'));

router.get('/dashboard', getDashboard);

module.exports = router;
