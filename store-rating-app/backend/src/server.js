require('dotenv').config();
const app = require('./app');
const { sequelize, User } = require('./models');

const PORT = process.env.PORT || 5000;

async function ensureSeedAdmin() {
  const adminCount = await User.count({ where: { role: 'admin' } });
  if (adminCount > 0) return;

  await User.create({
    name: process.env.SEED_ADMIN_NAME || 'System Administrator Account',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@storerating.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@1234',
    address: process.env.SEED_ADMIN_ADDRESS || 'Head Office, Platform Administration Building',
    role: 'admin',
  });

  console.log('---------------------------------------------------');
  console.log('No admin account found. A default admin was created:');
  console.log(`  Email:    ${process.env.SEED_ADMIN_EMAIL || 'admin@storerating.com'}`);
  console.log(`  Password: ${process.env.SEED_ADMIN_PASSWORD || 'Admin@1234'}`);
  console.log('Please log in and change this password immediately.');
  console.log('---------------------------------------------------');
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync({ alter: true });
    console.log('Database models synced.');

    await ensureSeedAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
