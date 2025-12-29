const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./production.db'
    }
  }
});

async function main() {
  console.log('=== TEST DES MOTS DE PASSE ===\n');

  // Hash actuel partagé
  const sharedHash = '$2b$10$ourY6dKTUpnd8lAhcS8a0OXVFY8cksCefyC2tBiAHoySYcqW9zVcO';

  // Test avec password123
  const isValid = await bcrypt.compare('password123', sharedHash);
  console.log(`Hash actuel + "password123": ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}\n`);

  if (!isValid) {
    console.log('❌ Le hash ne correspond pas à "password123"!');
    console.log('Génération de nouveaux hashes...\n');

    // Générer les nouveaux hashes
    const password123Hash = await bcrypt.hash('password123', 10);
    const superAdminHash = await bcrypt.hash('SuperAdmin2024!', 10);

    console.log('=== MISE À JOUR DES MOTS DE PASSE ===\n');

    // Mettre à jour tous les utilisateurs sauf super admin
    const regularUsers = await prisma.user.updateMany({
      where: {
        email: {
          not: 'superadmin@alicebot.com'
        }
      },
      data: {
        password: password123Hash
      }
    });

    console.log(`✅ ${regularUsers.count} utilisateurs mis à jour avec "password123"`);

    // Mettre à jour le super admin
    const superAdmin = await prisma.user.update({
      where: {
        email: 'superadmin@alicebot.com'
      },
      data: {
        password: superAdminHash
      }
    });

    console.log(`✅ Super Admin mis à jour avec "SuperAdmin2024!"\n`);

    console.log('=== VÉRIFICATION ===');
    const users = await prisma.user.findMany({
      select: {
        email: true,
        phone: true,
        role: true,
        password: true
      }
    });

    for (const user of users) {
      const pwd = user.email === 'superadmin@alicebot.com' ? 'SuperAdmin2024!' : 'password123';
      const valid = await bcrypt.compare(pwd, user.password);
      console.log(`${user.email.padEnd(30)} -> ${valid ? '✅' : '❌'}`);
    }
  } else {
    console.log('✅ Les hashes sont corrects!');
    console.log('\nVérification de tous les utilisateurs...\n');

    const users = await prisma.user.findMany({
      select: {
        email: true,
        phone: true,
        role: true,
        password: true
      }
    });

    for (const user of users) {
      const pwd = user.email === 'superadmin@alicebot.com' ? 'SuperAdmin2024!' : 'password123';
      const valid = await bcrypt.compare(pwd, user.password);
      console.log(`${user.email.padEnd(30)} ${user.phone.padEnd(15)} -> ${valid ? '✅' : '❌'}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
