const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getPublicProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { confirmationStatus: "ACCEPTED" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        competences: true,
        formation: true,
        experiences: true,
        photo: true,
        confirmationStatus: true,
        user: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.json({
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la recuperation des profils publics",
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profil introuvable" });
    }

    res.json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la recuperation du profil" });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
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
      message: "Erreur lors de la recuperation des profils",
    });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, competences, formation, experiences } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "Le prenom et le nom sont obligatoires",
      });
    }

    if (typeof firstName !== "string" || typeof lastName !== "string") {
      return res.status(400).json({ message: "Format de nom invalide" });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) {
      return res.status(400).json({ message: "Le prenom et le nom sont obligatoires" });
    }

    const maxLenByField = {
      competences: 500,
      formation: 500,
      experiences: 500,
      phone: 30,
    };

    const fieldsToCheck = [
      { key: "competences", value: competences, maxLen: maxLenByField.competences },
      { key: "formation", value: formation, maxLen: maxLenByField.formation },
      { key: "experiences", value: experiences, maxLen: maxLenByField.experiences },
      { key: "phone", value: phone, maxLen: maxLenByField.phone },
    ];

    for (const field of fieldsToCheck) {
      if (field.value && typeof field.value !== "string") {
        return res.status(400).json({ message: `Format invalide pour ${field.key}` });
      }
      if (typeof field.value === "string" && field.value.length > field.maxLen) {
        return res.status(400).json({ message: `${field.key} trop long (max ${field.maxLen})` });
      }
    }

    const normalizedPhone = typeof phone === "string" ? phone.trim() : null;
    const normalizedCompetences = typeof competences === "string" ? competences.trim() : null;
    const normalizedFormation = typeof formation === "string" ? formation.trim() : null;
    const normalizedExperiences = typeof experiences === "string" ? experiences.trim() : null;

    const cvFile = req.files?.cv?.[0];
    const photoFile = req.files?.photo?.[0];
    const cvPath = cvFile ? `/uploads/cvs/${cvFile.filename}` : undefined;
    const photoPath = photoFile ? `/uploads/photos/${photoFile.filename}` : undefined;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone: normalizedPhone,
        competences: normalizedCompetences,
        formation: normalizedFormation,
        experiences: normalizedExperiences,
        confirmationStatus: "PENDING",
        ...(cvPath && { cv: cvPath }),
        ...(photoPath && { photo: photoPath }),
      },
      create: {
        userId,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone: normalizedPhone,
        competences: normalizedCompetences,
        formation: normalizedFormation,
        experiences: normalizedExperiences,
        confirmationStatus: "PENDING",
        ...(cvPath && { cv: cvPath }),
        ...(photoPath && { photo: photoPath }),
      },
    });

    res.json({
      message: "Profil enregistre avec succes",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'enregistrement du profil",
    });
  }
};
