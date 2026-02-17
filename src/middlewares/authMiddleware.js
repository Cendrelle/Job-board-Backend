const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

/**
 * Middleware pour vérifier le token JWT
 */
function authenticateToken(req, res, next) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide" });
  }
}
/**
 * Middleware pour vérifier le rôle de l'utilisateur
 * @param {Array} roles
 */
function authorizeRole(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. You don't have access." });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
