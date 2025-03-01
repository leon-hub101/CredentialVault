const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Secret key for JWT (use a strong, unique key in production)
const JWT_SECRET = 'de2ff9a5defacfbcc0d1cc7b34743822c2542564a7b7873f468f25687775d635';

// Generate a JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
};

// Hash a password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare a password with its hash
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { generateToken, hashPassword, comparePassword, JWT_SECRET };