const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

exports.register = async (req, res) => {
  try {
    const { email, password} = req.body;
    const hashedPassword = await hashPassword(password);
    
    // Changement ici : on utilise passwordHash comme dans le schéma Prisma
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash: hashedPassword, // Match avec le schéma de Cendrelle
        role: 'CANDIDATE'    // Utilise CANDIDATE par défaut
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

    //res.json({ token, role: user.role });
    // ✅ COOKIE ICI
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });


  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};
