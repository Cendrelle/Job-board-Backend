const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_JOB_TYPES = ['CDI', 'CDD'];
const SOURCE_ALIASES = {
  INTERNAL: 'INTERNAL',
  SCRAPED: 'SCRAPED',
  EXTERNAL: 'SCRAPED',
};

function normalizeJobType(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return VALID_JOB_TYPES.includes(normalized) ? normalized : null;
}

function normalizeJobSource(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return SOURCE_ALIASES[normalized] || null;
}

function mapSourceForResponse(source) {
  if (source === 'SCRAPED') return 'EXTERNAL';
  return source;
}

function mapJobForResponse(job) {
  return {
    ...job,
    source: mapSourceForResponse(job.source),
  };
}

async function cleanupInvalidJobEnums() {
  await prisma.$executeRawUnsafe(`
    UPDATE jobs
    SET type = 'CDI'
    WHERE type IS NULL OR TRIM(type) = '' OR type NOT IN ('CDI', 'CDD')
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE jobs
    SET source = CASE
      WHEN UPPER(TRIM(source)) = 'EXTERNAL' THEN 'SCRAPED'
      ELSE 'INTERNAL'
    END
    WHERE source IS NULL OR TRIM(source) = '' OR source NOT IN ('INTERNAL', 'SCRAPED')
  `);
}

// 1. GET /api/jobs (Public : Liste + Recherche)
exports.getAllJobs = async (req, res) => {
  try {
    const { search } = req.query;

    const whereCondition = {
      isActive: true,
      type: { in: VALID_JOB_TYPES },
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
        description: true,
        location: true,
        type: true,
        source: true,
        isActive: true,
        updatedAt: true,
        createdAt: true,
      }
    });

    res.status(200).json(jobs.map(mapJobForResponse));
  } catch (error) {
    console.error(error);

    if (String(error?.message || '').includes("Value '' not found in enum 'JobType'")) {
      try {
        await cleanupInvalidJobEnums();
        const jobs = await prisma.job.findMany({
          where: {
            isActive: true,
            type: { in: VALID_JOB_TYPES },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            companyName: true,
            description: true,
            location: true,
            type: true,
            source: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return res.status(200).json(jobs.map(mapJobForResponse));
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }

    res.status(500).json({ error: "Erreur lors de la récupération des offres." });
  }
};

// 2. GET /api/jobs/:id (Public : Détails)
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: "ID d'offre invalide." });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: parsedId,
        type: { in: VALID_JOB_TYPES },
      },
    });

    if (!job) {
      return res.status(404).json({ error: "Offre non trouvée." });
    }

    res.status(200).json(mapJobForResponse(job));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 3. POST /api/jobs (Admin : Créer)
exports.createJob = async (req, res) => {
  try {
    const { title, companyName, description, location, type, companyLogo, source } = req.body;
    const normalizedType = normalizeJobType(type);
    const normalizedSource = normalizeJobSource(source || 'INTERNAL') || 'INTERNAL';

    if (!title || !companyName || !description || !normalizedType) {
      return res.status(400).json({ error: "Champs obligatoires manquants (title, companyName, description, type)." });
    }

    const newJob = await prisma.job.create({
      data: {
        title: String(title).trim(),
        companyName: String(companyName).trim(),
        description: String(description).trim(),
        location: location ? String(location).trim() : null,
        type: normalizedType,
        companyLogo: companyLogo ? String(companyLogo).trim() : null,
        source: normalizedSource,
      },
    });

    res.status(201).json(mapJobForResponse(newJob));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'offre." });
  }
};

// 4. PUT /api/jobs/:id (Admin : Modifier)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: "ID d'offre invalide." });
    }

    const data = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(data, 'type')) {
      const normalizedType = normalizeJobType(data.type);
      if (!normalizedType) {
        return res.status(400).json({ error: "Type d'offre invalide. Valeurs attendues: CDI, CDD." });
      }
      data.type = normalizedType;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'source')) {
      const normalizedSource = normalizeJobSource(data.source);
      if (!normalizedSource) {
        return res.status(400).json({ error: "Source invalide. Valeurs attendues: INTERNAL, EXTERNAL." });
      }
      data.source = normalizedSource;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'title') && typeof data.title === 'string') {
      data.title = data.title.trim();
    }

    if (Object.prototype.hasOwnProperty.call(data, 'companyName') && typeof data.companyName === 'string') {
      data.companyName = data.companyName.trim();
    }

    if (Object.prototype.hasOwnProperty.call(data, 'description') && typeof data.description === 'string') {
      data.description = data.description.trim();
    }

    if (Object.prototype.hasOwnProperty.call(data, 'location')) {
      data.location = data.location ? String(data.location).trim() : null;
    }

    const updatedJob = await prisma.job.update({
      where: { id: parsedId },
      data: data,
    });

    res.status(200).json(mapJobForResponse(updatedJob));
  } catch (error) {
    console.error(error);
    if (error.code === 'P2025') return res.status(404).json({ error: "Offre introuvable." });
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
};

// 5. DELETE /api/jobs/:id (Admin : Supprimer)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: "ID d'offre invalide." });
    }

    await prisma.job.delete({
      where: { id: parsedId },
    });

    res.status(200).json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Offre introuvable." });
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
};
