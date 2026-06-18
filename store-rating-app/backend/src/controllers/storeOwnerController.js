const { Store, Rating, User } = require('../models');

async function getDashboard(req, res) {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });

    if (!store) {
      return res.json({
        store: null,
        averageRating: 0,
        totalRatings: 0,
        raters: [],
        message: 'No store has been linked to your account yet. Please contact an administrator.',
      });
    }

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }],
      order: [['updatedAt', 'DESC']],
    });

    const values = ratings.map((r) => r.rating);
    const averageRating = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const raters = ratings.map((r) => ({
      ratingId: r.id,
      score: r.rating,
      submittedAt: r.updatedAt,
      user: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email, address: r.user.address } : null,
    }));

    return res.json({
      store: { id: store.id, name: store.name, email: store.email, address: store.address },
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: values.length,
      raters,
    });
  } catch (err) {
    console.error('Store owner dashboard error:', err);
    return res.status(500).json({ message: 'Could not load your store dashboard.' });
  }
}

module.exports = { getDashboard };
