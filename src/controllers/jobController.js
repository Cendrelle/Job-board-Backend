const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET /api/jobs (Public : Liste + Recherche)
exports.getAllJobs = async (req, res) => {
  try {
    const { search } = req.query;

    const whereCondition = {
      isActive: true,
    };

    if (search) {
      whereCondition.OR = [
        { title: { contains: search } }, 
        { description: { contains: search } },
        { companyName: { contains: search } },
        { location: { contains: search } }
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }, 
      select: { 
        id: true,
        title: true,
        companyName: true,
        location: true,
        type: true,
        createdAt: true,
      }
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des offres." });
  }
};

// 2. GET /api/jobs/:id (Public : Détails)
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
    });

    if (!job) {
      return res.status(404).json({ error: "Offre non trouvée." });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 3. POST /api/jobs (Admin : Créer)
exports.createJob = async (req, res) => {
  try {
    const { title, companyName, description, location, type, companyLogo } = req.body;

    if (!title || !companyName || !description || !type) {
      return res.status(400).json({ error: "Champs obligatoires manquants (title, companyName, description, type)." });
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        companyName,
        description,
        location,
        type,
        companyLogo,
        source: 'INTERNAL'
      },
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'offre." });
  }
};

// 4. PUT /api/jobs/:id (Admin : Modifier)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body; 

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: data,
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Offre introuvable." });
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
};

// 5. DELETE /api/jobs/:id (Admin : Supprimer)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.job.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Offre introuvable." });
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
};