exports.applyToJob = async (req, res) => {
  const userId = req.user.id;
  const jobId = Number(req.params.id);

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

  res.status(201).json({
    message: "Candidature envoyée avec succès",
    application,
  });
};
