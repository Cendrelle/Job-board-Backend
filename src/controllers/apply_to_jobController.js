const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendApplicationNotificationToAdmin } = require("../utils/emailService");

exports.applyToJob = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Non authentifie." });
  }

  const userId = req.user.id;
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    return res.status(400).json({ message: "ID d'offre invalide." });
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, companyName: true, isActive: true },
    });

    if (!job) {
      return res.status(404).json({ message: "Offre introuvable." });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: "Cette offre n'accepte plus de candidatures." });
    }

    // Verifier le profil + CV
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.cv) {
      return res.status(400).json({
        message: "Veuillez completer votre profil et uploader votre CV",
      });
    }

    // Empecher double candidature
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "Vous avez deja postule a cette offre",
      });
    }

    // Creer la candidature
    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
      },
    });

    // Recuperer les infos candidat pour la notification
    const candidate = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    const adminEmail = process.env.ADMIN_EMAIL || "admin@jobbooster.com";
    sendApplicationNotificationToAdmin(adminEmail, candidate, job).catch((err) =>
      console.error("Erreur lors de l'envoi de l'email:", err)
    );

    res.status(201).json({
      message: "Candidature envoyee avec succes",
      application,
    });
  } catch (error) {
    console.error("Erreur lors de la candidature:", error);
    res.status(500).json({
      message: "Erreur lors de la soumission de la candidature",
    });
  }
};
