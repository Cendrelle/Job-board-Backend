const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

exports.register = async (req, res) => {
  try {
    const body = req.body;

    if (!body.email || !body.password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const hashedPassword = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: hashedPassword,
        role: body.role || 'CANDIDATE'
      }
    });

    res.status(201).json({ message: "Utilisateur créé", userId: user.id });

  } catch (error) {
    res.status(400).json({ error: "Erreur lors de l'inscription" });
  }
};

exports.login = async (req, res) => {
  try {
    const body = req.body;

    if (!body || !body.email || !body.password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const passwordValid = await comparePassword(body.password, user.passwordHash);

    if (!passwordValid) return res.status(401).json({ error: "Identifiants invalides" });

    const token = generateToken(user);

    res.json({ token, role: user.role });

  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
