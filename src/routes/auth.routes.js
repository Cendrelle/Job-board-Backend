const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Inscription : POST /api/auth/register
router.post("/register", authController.register);

// Connexion : POST /api/auth/login
router.post("/login", authController.login);

// Deconnexion : POST /api/auth/logout
router.post("/logout", authController.logout);

// Profil minimal
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
