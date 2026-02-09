const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utiliser le même secret que dans le middleware
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * 1️⃣ Hacher le mot de passe (sécurité)
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * 2️⃣ Comparer le mot de passe lors de la connexion
 */
const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

/**
 * 3️⃣ Créer le Token JWT
 * Inclut id, email et role pour pouvoir utiliser req.user dans le middleware
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role }, // inclure email si besoin
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { hashPassword, comparePassword, generateToken };
