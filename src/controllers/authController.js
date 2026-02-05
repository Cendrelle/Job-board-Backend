const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

// Inscription (Register)
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: { email, password_hash: hashedPassword, role }
    });

    res.status(201).json({ message: "Utilisateur créé !", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: "Erreur lors de l'inscription." });
  }
};

// Connexion (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = generateToken(user);
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};