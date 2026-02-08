const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Inscription : POST /api/auth/register
router.post('/register', authController.register);

// Connexion : POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;