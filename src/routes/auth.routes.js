
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const applyToJobController = require('../controllers/apply_to_jobController');

const { createOrUpdateProfile } = require("../controllers/profileController");

const { authenticateToken } = require('../middlewares/authMiddleware');


// Inscription : POST /api/auth/register
router.post('/register', authController.register);

// Connexion : POST /api/auth/login
router.post('/login', authController.login);

// gestion des candidatures : POST /api/jobs/:id/apply

router.post("/jobs/:id/apply", applyToJobController.applyToJob);


// Gestion des candidatures : POST /api/jobs/:id/apply
// Protégé : nécessite une authentification JWT
router.post("/jobs/:id/apply", authenticateToken, applyToJobController.applyToJob);

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});
module.exports = router;