const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} = require('../utils/validators');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}


async function signup(req, res) {
  try {
    const { name, email, password, address } = req.body;

    const errors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const addressErr = validateAddress(address);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    if (addressErr) errors.address = addressErr;

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed.', errors });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, address, role: 'user' });
    const token = signToken(user);

    return res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Something went wrong while creating your account.' });
  }
}
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    return res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Something went wrong while logging in.' });
  }
}

async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const passwordErr = validatePassword(newPassword);
    if (passwordErr) {
      return res.status(422).json({ message: 'Validation failed.', errors: { newPassword: passwordErr } });
    }

    const user = req.user;
    const isMatch = await user.comparePassword(currentPassword || '');
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ message: 'Something went wrong while updating your password.' });
  }
}

async function me(req, res) {
  return res.json({ user: req.user.toSafeJSON() });
}

module.exports = { signup, login, updatePassword, me };
