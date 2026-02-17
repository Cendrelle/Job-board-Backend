const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

exports.register = async (req, res) => {
  try {
    const { email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const hashedPassword = await hashPassword(password);
    
    // Changement ici : on utilise passwordHash comme dans le schéma Prisma
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash: hashedPassword, // Match avec le schéma de Cendrelle
        role: 'CANDIDATE'    // Utilise CANDIDATE par défaut
      }
    });

    const token = generateToken(user);
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.status(201).json({
      message: "Utilisateur créé",
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "Cet email est deja utilise" });
    }
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
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({ message: "Deconnexion reussie" });
};
