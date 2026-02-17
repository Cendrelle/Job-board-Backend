require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function normalizeInvalidUserDatetimeValues() {
  await prisma.$executeRawUnsafe(`
    UPDATE users
    SET created_at = NOW(3)
    WHERE created_at IS NULL
       OR created_at = '0000-00-00 00:00:00'
       OR YEAR(created_at) = 0
       OR MONTH(created_at) = 0
       OR DAY(created_at) = 0
  `);
}

async function resetAdminPassword() {
  try {
    await normalizeInvalidUserDatetimeValues();

    // 1. Récupérer les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 2. Valider les variables
    if (!adminEmail || !adminPassword) {
      throw new Error('❌ Variables d\'environnement manquantes : ADMIN_EMAIL et ADMIN_PASSWORD sont requises.');
    }

    // 3. Valider le format du mot de passe
    if (adminPassword.length < 8) {
      throw new Error('❌ Le mot de passe admin doit contenir au moins 8 caractères.');
    }

    // 4. Vérifier que l'admin existe
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`❌ Admin avec l'email ${adminEmail} non trouvé. Exécutez d'abord "npm run db:seed".`);
    }

    // 5. Hasher et mettre à jour le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash: hashedPassword },
    });

    console.log(`✅ Admin Password Reset: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
