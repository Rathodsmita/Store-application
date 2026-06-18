const { Op, fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');
const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} = require('../utils/validators');

const ALLOWED_ROLES = ['admin', 'user', 'store_owner'];
const USER_SORT_FIELDS = ['name', 'email', 'address', 'role', 'createdAt'];
const STORE_SORT_FIELDS = ['name', 'email', 'address', 'rating', 'createdAt'];

function getSort(field, dir, allowedFields, fallback = 'createdAt') {
  const sortField = allowedFields.includes(field) ? field : fallback;
  const sortDir = String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return [sortField, sortDir];
}


async function getDashboard(req, res) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);
    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ message: 'Could not load dashboard statistics.' });
  }
}


async function createUser(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    const errors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const addressErr = validateAddress(address);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    if (addressErr) errors.address = addressErr;
    if (!ALLOWED_ROLES.includes(role)) errors.role = 'Role must be admin, user, or store_owner.';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed.', errors });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, address, role });
    return res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Something went wrong while creating the user.' });
  }
}


async function listUsers(req, res) {
  try {
    const { name, email, address, role, sortBy, sortDir } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role && ALLOWED_ROLES.includes(role)) where.role = role;

    const order = [getSort(sortBy, sortDir, USER_SORT_FIELDS)];

    const users = await User.findAll({
      where,
      order,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });

    
    const storeOwnerIds = users.filter((u) => u.role === 'store_owner').map((u) => u.id);
    let ratingByOwner = {};
    if (storeOwnerIds.length > 0) {
      const stores = await Store.findAll({
        where: { ownerId: { [Op.in]: storeOwnerIds } },
        include: [{ model: Rating, as: 'ratings', attributes: ['rating'] }],
      });
      ratingByOwner = stores.reduce((acc, s) => {
        const values = s.ratings.map((r) => r.rating);
        acc[s.ownerId] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        return acc;
      }, {});
    }

    const result = users.map((u) => {
      const json = u.toJSON();
      if (u.role === 'store_owner') {
        json.rating = Math.round((ratingByOwner[u.id] || 0) * 10) / 10;
      }
      return json;
    });

    return res.json({ users: result });
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ message: 'Could not load users.' });
  }
}


async function getUserDetail(req, res) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const json = user.toJSON();

    if (user.role === 'store_owner') {
      const store = await Store.findOne({ where: { ownerId: user.id } });
      if (store) {
        const avg = await Rating.findOne({
          where: { storeId: store.id },
          attributes: [[fn('COALESCE', fn('AVG', col('rating')), 0), 'avgRating']],
          raw: true,
        });
        json.rating = Math.round((parseFloat(avg.avgRating) || 0) * 10) / 10;
        json.storeName = store.name;
      } else {
        json.rating = 0;
      }
    }

    return res.json({ user: json });
  } catch (err) {
    console.error('Get user detail error:', err);
    return res.status(500).json({ message: 'Could not load user details.' });
  }
}


async function createStore(req, res) {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors = {};
    if (!name || name.trim().length === 0) errors.name = 'Store name is required.';
    const emailErr = validateEmail(email);
    const addressErr = validateAddress(address);
    if (emailErr) errors.email = emailErr;
    if (addressErr) errors.address = addressErr;

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== 'store_owner') {
        errors.ownerId = 'Selected owner must be an existing user with the Store Owner role.';
      } else {
        const alreadyOwns = await Store.findOne({ where: { ownerId } });
        if (alreadyOwns) {
          errors.ownerId = 'This user already owns a store.';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed.', errors });
    }

    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A store with this email already exists.' });
    }

    const store = await Store.create({ name, email, address, ownerId: ownerId || null });
    return res.status(201).json({ store });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ message: 'Something went wrong while creating the store.' });
  }
}


async function listStores(req, res) {
  try {
    const { name, email, address, sortBy, sortDir } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const allowSortInDb = STORE_SORT_FIELDS.includes(sortBy) && sortBy !== 'rating';
    const order = allowSortInDb ? [getSort(sortBy, sortDir, STORE_SORT_FIELDS)] : [['createdAt', 'DESC']];

    const stores = await Store.findAll({
      where,
      order,
      include: [{ model: Rating, as: 'ratings', attributes: ['rating'] }],
    });

    let result = stores.map((s) => {
      const ratings = s.ratings.map((r) => r.rating);
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: Math.round(avg * 10) / 10,
        totalRatings: ratings.length,
      };
    });

    if (sortBy === 'rating') {
      const dir = String(sortDir).toLowerCase() === 'desc' ? -1 : 1;
      result = result.sort((a, b) => (a.rating - b.rating) * dir);
    }

    return res.json({ stores: result });
  } catch (err) {
    console.error('List stores error:', err);
    return res.status(500).json({ message: 'Could not load stores.' });
  }
}


async function listAvailableStoreOwners(req, res) {
  try {
    const owners = await User.findAll({
      where: { role: 'store_owner' },
      attributes: ['id', 'name', 'email'],
    });
    const stores = await Store.findAll({ attributes: ['ownerId'] });
    const taken = new Set(stores.map((s) => s.ownerId).filter(Boolean));
    const available = owners.filter((o) => !taken.has(o.id));
    return res.json({ owners: available });
  } catch (err) {
    console.error('List available owners error:', err);
    return res.status(500).json({ message: 'Could not load store owners.' });
  }
}

module.exports = {
  getDashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
  listAvailableStoreOwners,
};
