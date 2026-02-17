const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const VALID_JOB_TYPES = ["CDI", "CDD"];
const VALID_JOB_SOURCES = ["INTERNAL", "SCRAPED"];

function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function normalizeJobSource(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "EXTERNAL") return "SCRAPED";
  return VALID_JOB_SOURCES.includes(normalized) ? normalized : null;
}

function mapJobSourceForResponse(value) {
  return value === "SCRAPED" ? "EXTERNAL" : value;
}

function normalizeJobStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "ACTIVE") return true;
  if (normalized === "INACTIVE") return false;
  return null;
}

async function ensureJobsEnumIntegrity() {
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

exports.getDashboardStats = async (req, res) => {
  try {
    await ensureJobsEnumIntegrity();
    const monthStart = getMonthStart();

    const [
      totalUsers,
      totalCandidates,
      totalAdmins,
      totalJobs,
      activeJobs,
      totalApplications,
      jobsPostedThisMonth,
      applicationsThisMonth,
      pendingCandidateProfiles,
      acceptedCandidateProfiles,
      rejectedCandidateProfiles,
      groupedJobTypes,
      groupedJobSources,
      groupedStatuses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.job.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.application.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.profile.count({ where: { confirmationStatus: "PENDING" } }),
      prisma.profile.count({ where: { confirmationStatus: "ACCEPTED" } }),
      prisma.profile.count({ where: { confirmationStatus: "REJECTED" } }),
      prisma.job.groupBy({
        by: ["type"],
        where: { type: { in: VALID_JOB_TYPES } },
        _count: { type: true },
      }),
      prisma.job.groupBy({
        by: ["source"],
        where: { source: { in: VALID_JOB_SOURCES }, type: { in: VALID_JOB_TYPES } },
        _count: { source: true },
      }),
      prisma.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const applicationsByStatus = {
      PENDING: 0,
      REVIEWED: 0,
      REJECTED: 0,
    };

    for (const group of groupedStatuses) {
      if (group.status in applicationsByStatus) {
        applicationsByStatus[group.status] = group._count.status;
      }
    }

    const jobsByType = {
      CDI: 0,
      CDD: 0,
    };

    for (const group of groupedJobTypes) {
      if (group.type in jobsByType) {
        jobsByType[group.type] = group._count.type;
      }
    }

    const jobsBySource = {
      INTERNAL: 0,
      EXTERNAL: 0,
    };

    for (const group of groupedJobSources) {
      const sourceKey = mapJobSourceForResponse(group.source);
      if (sourceKey in jobsBySource) {
        jobsBySource[sourceKey] = group._count.source;
      }
    }

    res.json({
      totalUsers,
      totalCandidates,
      totalAdmins,
      totalJobs,
      activeJobs,
      totalApplications,
      applicationsByStatus,
      jobsPostedThisMonth,
      applicationsThisMonth,
      averageApplicationsPerJob: totalJobs > 0 ? totalApplications / totalJobs : 0,
      candidateConfirmation: {
        pending: pendingCandidateProfiles,
        accepted: acceptedCandidateProfiles,
        rejected: rejectedCandidateProfiles,
      },
      jobsByType,
      jobsBySource,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur dashboard stats:", error);
    res.status(500).json({ message: "Erreur lors du chargement des statistiques" });
  }
};

exports.getAdminJobs = async (req, res) => {
  try {
    await ensureJobsEnumIntegrity();
    const search = String(req.query.search || "").trim();
    const type = String(req.query.type || "").trim().toUpperCase();
    const source = normalizeJobSource(req.query.source);
    const status = normalizeJobStatus(req.query.status);

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { companyName: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (VALID_JOB_TYPES.includes(type)) {
      where.type = type;
    }

    if (source) {
      where.source = source;
    }

    if (status !== null) {
      where.isActive = status;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const normalizedJobs = jobs.map((job) => ({
      ...job,
      source: mapJobSourceForResponse(job.source),
    }));

    res.json({
      total: normalizedJobs.length,
      data: normalizedJobs,
      filters: {
        search,
        type: VALID_JOB_TYPES.includes(type) ? type : "ALL",
        source: source ? mapJobSourceForResponse(source) : "ALL",
        status: status === null ? "ALL" : status ? "ACTIVE" : "INACTIVE",
      },
    });
  } catch (error) {
    console.error("Erreur liste offres admin:", error);
    res.status(500).json({ message: "Erreur lors du chargement des offres admin" });
  }
};

exports.getPendingCandidateProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { confirmationStatus: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.json({ count: profiles.length, profiles });
  } catch (error) {
    console.error("Erreur profils en attente:", error);
    res.status(500).json({ message: "Erreur lors du chargement des profils en attente" });
  }
};

exports.updateCandidateConfirmation = async (req, res) => {
  try {
    const profileId = Number(req.params.profileId);
    const status = String(req.body?.status || "").toUpperCase();

    if (!Number.isInteger(profileId) || profileId <= 0) {
      return res.status(400).json({ message: "profileId invalide" });
    }

    if (!["ACCEPTED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ message: "Statut de confirmation invalide" });
    }

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: { confirmationStatus: status },
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

    res.json({ message: "Confirmation mise a jour", profile });
  } catch (error) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Profil introuvable" });
    }
    console.error("Erreur confirmation profil:", error);
    res.status(500).json({ message: "Erreur lors de la confirmation du profil" });
  }
};

exports.updateCandidateContractStatus = async (req, res) => {
  try {
    const profileId = Number(req.params.profileId);
    const isUnderContract = Boolean(req.body?.isUnderContract);

    if (!Number.isInteger(profileId) || profileId <= 0) {
      return res.status(400).json({ message: "profileId invalide" });
    }

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: { isUnderContract },
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

    res.json({ message: "Statut de contrat mis a jour", profile });
  } catch (error) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Profil introuvable" });
    }
    console.error("Erreur mise a jour statut contrat:", error);
    res.status(500).json({ message: "Erreur lors de la mise a jour du statut de contrat" });
  }
};

