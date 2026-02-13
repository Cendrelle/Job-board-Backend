require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Récupérer les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 2. Valider les variables
    if (!adminEmail || !adminPassword) {
      throw new Error('❌ Variables d\'environnement manquantes : ADMIN_EMAIL et ADMIN_PASSWORD sont requises.');
    }

    // 3. Valider le format du mot de passe (min 8 caractères)
    if (adminPassword.length < 8) {
      throw new Error('❌ Le mot de passe admin doit contenir au moins 8 caractères.');
    }

    // 4. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 5. Upsert - Creer ou mettre a jour l'admin
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: 'ADMIN', // Garantir les droits ADMIN
      },
      create: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`✅ Admin Created: ${user.email} (ID: ${user.id})`);

    // 6. Seed candidats de demo
    const demoCandidates = [
      {
        email: 'candidat1@jobboard.local',
        firstName: 'Aminata',
        lastName: 'Diallo',
        phone: '+33 6 11 22 33 44',
        competences: 'React, TypeScript, Next.js',
        formation: 'Master Informatique',
        experiences: '3 ans en developpement frontend',
        confirmationStatus: 'ACCEPTED',
      },
      {
        email: 'candidat2@jobboard.local',
        firstName: 'Yassine',
        lastName: 'Benali',
        phone: '+33 6 55 66 77 88',
        competences: 'Node.js, Prisma, MySQL',
        formation: 'Licence Genie Logiciel',
        experiences: '2 ans en developpement backend',
        confirmationStatus: 'PENDING',
      },
      {
        email: 'candidat3@jobboard.local',
        firstName: 'Sofia',
        lastName: 'Martins',
        phone: '+33 7 10 20 30 40',
        competences: 'UX, Figma, Design System',
        formation: 'Master UX Design',
        experiences: '4 ans en design produit',
        confirmationStatus: 'ACCEPTED',
      },
    ];

    for (const candidate of demoCandidates) {
      const candidateUser = await prisma.user.upsert({
        where: { email: candidate.email },
        update: {
          role: 'CANDIDATE',
        },
        create: {
          email: candidate.email,
          passwordHash: hashedPassword,
          role: 'CANDIDATE',
        },
      });

      await prisma.profile.upsert({
        where: { userId: candidateUser.id },
        update: {
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          phone: candidate.phone,
          competences: candidate.competences,
          formation: candidate.formation,
          experiences: candidate.experiences,
          confirmationStatus: candidate.confirmationStatus,
        },
        create: {
          userId: candidateUser.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          phone: candidate.phone,
          competences: candidate.competences,
          formation: candidate.formation,
          experiences: candidate.experiences,
          confirmationStatus: candidate.confirmationStatus,
        },
      });
    }

    // 7. Seed offres de demo
    const demoJobs = [
      {
        title: 'Developpeur Frontend React',
        companyName: 'TechNova',
        description: 'Vous developpez des interfaces React performantes pour notre produit SaaS.',
        location: 'Paris',
        type: 'CDI',
      },
      {
        title: 'Developpeur Backend Node.js',
        companyName: 'DataFlow',
        description: 'Conception et maintenance d APIs Node.js/Prisma pour des services metier.',
        location: 'Lyon',
        type: 'CDI',
      },
      {
        title: 'UX UI Designer',
        companyName: 'PixelForge',
        description: 'Creation de parcours utilisateurs et maquettes high-fidelity.',
        location: 'Remote',
        type: 'CDD',
      },
    ];

    for (const job of demoJobs) {
      const existing = await prisma.job.findFirst({
        where: {
          title: job.title,
          companyName: job.companyName,
        },
      });

      if (!existing) {
        await prisma.job.create({
          data: {
            ...job,
            source: 'INTERNAL',
            isActive: true,
          },
        });
      }
    }

    console.log('✅ Demo candidates/profiles/jobs seeded');
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
