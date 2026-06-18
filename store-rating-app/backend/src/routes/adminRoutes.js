const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
  listAvailableStoreOwners,
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);

router.post('/users', createUser);
router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);

router.post('/stores', createStore);
router.get('/stores', listStores);
router.get('/store-owners-available', listAvailableStoreOwners);

module.exports = router;
