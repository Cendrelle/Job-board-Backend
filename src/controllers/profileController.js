
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, description } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "Le prénom et le nom sont obligatoires",
      });
    }

    // Si un CV est envoyé
    const cvPath = req.file
      ? `/uploads/cvs/${req.file.filename}`
      : undefined;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        phone,
        description,
        ...(cvPath && { cv: cvPath }),
      },
      create: {
        userId,
        firstName,
        lastName,
        phone,
        description,
        ...(cvPath && { cv: cvPath }),
      },
    });

    res.json({
      message: "Profil enregistré avec succès",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'enregistrement du profil",
    });
  }
};
