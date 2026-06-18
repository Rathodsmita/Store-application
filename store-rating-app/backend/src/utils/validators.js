const validator = require('validator');

const RULES = {
  name: { min: 20, max: 60 },
  address: { max: 400 },
  password: { min: 8, max: 16 },
};

function validateName(name) {
  if (typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < RULES.name.min || trimmed.length > RULES.name.max) {
    return `Name must be between ${RULES.name.min} and ${RULES.name.max} characters.`;
  }
  return null;
}

function validateAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0) {
    return 'Address is required.';
  }
  if (address.length > RULES.address.max) {
    return `Address must not exceed ${RULES.address.max} characters.`;
  }
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string' || !validator.isEmail(email)) {
    return 'A valid email address is required.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required.';
  const { min, max } = RULES.password;
  if (password.length < min || password.length > max) {
    return `Password must be between ${min} and ${max} characters.`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(password)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be a whole number between 1 and 5.';
  }
  return null;
}

module.exports = {
  RULES,
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRating,
};
