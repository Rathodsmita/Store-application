export function validateName(name) {
  const trimmed = (name || '').trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
}

export function validateAddress(address) {
  if (!address || address.trim().length === 0) return 'Address is required.';
  if (address.length > 400) return 'Address must not exceed 400 characters.';
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || !EMAIL_RE.test(email)) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter.';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(password)) {
    return 'Include at least one special character.';
  }
  return null;
}
