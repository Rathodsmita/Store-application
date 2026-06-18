const { Op, fn, col } = require('sequelize');
const { Store, Rating } = require('../models');
const { validateRating } = require('../utils/validators');

const SORTABLE = ['name', 'address', 'rating'];

async function listStores(req, res) {
  try {
    const { name, address, sortBy, sortDir } = req.query;
    const userId = req.user.id;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const stores = await Store.findAll({
      where,
      include: [{ model: Rating, as: 'ratings', attributes: ['rating', 'userId'] }],
    });

    let result = stores.map((s) => {
      const ratings = s.ratings.map((r) => r.rating);
      const overall = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const mine = s.ratings.find((r) => r.userId === userId);
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        overallRating: Math.round(overall * 10) / 10,
        totalRatings: ratings.length,
        userRating: mine ? mine.rating : null,
      };
    });

    const field = SORTABLE.includes(sortBy) ? sortBy : 'name';
    const dir = String(sortDir).toLowerCase() === 'desc' ? -1 : 1;
    result = result.sort((a, b) => {
      const fa = field === 'rating' ? a.overallRating : a[field];
      const fb = field === 'rating' ? b.overallRating : b[field];
      if (fa < fb) return -1 * dir;
      if (fa > fb) return 1 * dir;
      return 0;
    });

    return res.json({ stores: result });
  } catch (err) {
    console.error('List stores (user) error:', err);
    return res.status(500).json({ message: 'Could not load stores.' });
  }
}

async function submitRating(req, res) {
  try {
    const storeId = req.params.id;
    const { rating } = req.body;
    const userId = req.user.id;

    const ratingErr = validateRating(rating);
    if (ratingErr) {
      return res.status(422).json({ message: 'Validation failed.', errors: { rating: ratingErr } });
    }

    const store = await Store.findByPk(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const [record, created] = await Rating.findOrCreate({
      where: { userId, storeId },
      defaults: { rating: Number(rating) },
    });

    if (!created) {
      record.rating = Number(rating);
      await record.save();
    }

    return res.status(created ? 201 : 200).json({
      message: created ? 'Rating submitted.' : 'Rating updated.',
      rating: record,
    });
  } catch (err) {
    console.error('Submit rating error:', err);
    return res.status(500).json({ message: 'Something went wrong while submitting your rating.' });
  }
}

module.exports = { listStores, submitRating };
