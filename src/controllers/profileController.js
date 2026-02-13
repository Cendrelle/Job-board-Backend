
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json({
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des profils",
    });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, competences, formation, experiences } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "Le prénom et le nom sont obligatoires",
      });
    }

    if (typeof firstName !== "string" || typeof lastName !== "string") {
      return res.status(400).json({ message: "Format de nom invalide" });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) {
      return res.status(400).json({ message: "Le prénom et le nom sont obligatoires" });
    }

    const maxLen = 500;
    const fieldsToCheck = [
      { key: "competences", value: competences },
      { key: "formation", value: formation },
      { key: "experiences", value: experiences },
      { key: "phone", value: phone },
    ];

    for (const field of fieldsToCheck) {
      if (field.value && typeof field.value !== "string") {
        return res.status(400).json({ message: `Format invalide pour ${field.key}` });
      }
      if (typeof field.value === "string" && field.value.length > maxLen) {
        return res.status(400).json({ message: `${field.key} trop long (max ${maxLen})` });
      }
    }

    // Si un CV est envoyé
    const cvPath = req.file
      ? `/uploads/cvs/${req.file.filename}`
      : undefined;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone,
        competences,
        formation,
        experiences,
        ...(cvPath && { cv: cvPath }),
      },
      create: {
        userId,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone,
        competences,
        formation,
        experiences,
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
