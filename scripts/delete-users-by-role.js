const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./production.db'
    }
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const ROLES = {
  '1': 'AGENT',
  '2': 'ADMIN',
  '3': 'SUPPORT',
  '4': 'CLIENT',
  '5': 'SUPER_ADMIN'
};

async function main() {
  console.log('\n=== SUPPRESSION D\'UTILISATEURS PAR RÔLE ===\n');

  try {
    // Choisir le rôle
    console.log('Choisissez le rôle à supprimer:');
    Object.entries(ROLES).forEach(([key, value]) => {
      console.log(`  ${key}. ${value}`);
    });
    console.log('');

    const roleChoice = await question('Rôle (1-5): ');
    const selectedRole = ROLES[roleChoice];

    if (!selectedRole) {
      console.log('\n❌ Choix invalide\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Compter les utilisateurs
    const count = await prisma.user.count({
      where: { role: selectedRole }
    });

    if (count === 0) {
      console.log(`\n✅ Aucun utilisateur avec le rôle ${selectedRole}\n`);
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Afficher les utilisateurs
    console.log(`\n📋 Utilisateurs ${selectedRole} trouvés: ${count}\n`);
    const users = await prisma.user.findMany({
      where: { role: selectedRole },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    console.log('------------------------------------');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.phone} - ${user.firstName} ${user.lastName}`);
    });
    console.log('------------------------------------\n');

    // Demander confirmation
    console.log(`⚠️  ATTENTION: Vous allez supprimer ${count} utilisateur(s) avec le rôle ${selectedRole}`);
    const confirm = await question('\nTapez "SUPPRIMER" en majuscules pour confirmer: ');

    if (confirm !== 'SUPPRIMER') {
      console.log('\n❌ Suppression annulée\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Supprimer les utilisateurs
    console.log('\n🗑️  Suppression en cours...');
    const result = await prisma.user.deleteMany({
      where: { role: selectedRole }
    });

    console.log(`\n✅✅✅ ${result.count} utilisateur(s) supprimé(s) avec succès ✅✅✅\n`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
