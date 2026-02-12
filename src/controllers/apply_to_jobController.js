const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendApplicationNotificationToAdmin } = require('../utils/emailService');

exports.applyToJob = async (req, res) => {
  const userId = req.user.id;
  const jobId = Number(req.params.id);

  try {
    // 1️⃣ Vérifier le profil + CV
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.cv) {
      return res.status(400).json({
        message: "Veuillez compléter votre profil et uploader votre CV",
      });
    }

    // 2️⃣ Empêcher double candidature
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
        message: "Vous avez déjà postulé à cette offre",
      });
    }

    // 3️⃣ Créer la candidature
    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
      },
    });

    // 4️⃣ Récupérer les infos pour la notification (candidat + job)
    const candidate = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, companyName: true },
    });

    // 5️⃣ Envoyer email admin (asynchrone, ne bloque pas la réponse)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jobbooster.com';
    sendApplicationNotificationToAdmin(adminEmail, candidate, job).catch((err) =>
      console.error('Erreur lors de l\'envoi de l\'email:', err)
    );

    res.status(201).json({
      message: "Candidature envoyée avec succès",
      application,
    });
  } catch (error) {
    console.error('Erreur lors de la candidature:', error);
    res.status(500).json({
      message: "Erreur lors de la soumission de la candidature",
    });
  }
};
