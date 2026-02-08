const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Hacher le mot de passe (sécurité)
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 2. Comparer le mot de passe lors de la connexion
const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

// 3. Créer le Token JWT (valable 24h)
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { hashPassword, comparePassword, generateToken };