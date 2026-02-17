const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const verifyToken = (req, res, next) => {
  // Recuperer le token dans le header "Authorization"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Acces refuse. Token manquant." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token invalide ou expire." });
  }
};

module.exports = verifyToken;
