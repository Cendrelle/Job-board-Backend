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

    // 5. Upsert - Créer ou mettre à jour l'admin
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
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
