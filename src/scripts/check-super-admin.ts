import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification du Super Admin...\n');

  const superAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { isSuperAdmin: true },
        { email: 'superadmin@alicebot.com' },
      ],
    },
  });

  if (!superAdmin) {
    console.log('❌ Aucun Super Admin trouvé!\n');
    console.log('Exécutez: npx ts-node src/scripts/create-super-admin.ts\n');
    return;
  }

  console.log('📊 Données du Super Admin:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ID:            ', superAdmin.id);
  console.log('Email:         ', superAdmin.email);
  console.log('Phone:         ', superAdmin.phone);
  console.log('Nom:           ', `${superAdmin.firstName} ${superAdmin.lastName}`);
  console.log('Role:          ', superAdmin.role);
  console.log('isSuperAdmin:  ', superAdmin.isSuperAdmin);
  console.log('isActive:      ', superAdmin.isActive);
  console.log('isVerified:    ', superAdmin.isVerified);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Vérifications
  const issues: string[] = [];
  if (superAdmin.role !== 'SUPER_ADMIN') {
    issues.push(`❌ Role incorrect: "${superAdmin.role}" (devrait être "SUPER_ADMIN")`);
  }
  if (superAdmin.isSuperAdmin !== true) {
    issues.push(`❌ isSuperAdmin incorrect: ${superAdmin.isSuperAdmin} (devrait être true)`);
  }
  if (superAdmin.isActive !== true) {
    issues.push(`❌ isActive incorrect: ${superAdmin.isActive} (devrait être true)`);
  }

  if (issues.length > 0) {
    console.log('⚠️  PROBLÈMES DÉTECTÉS:\n');
    issues.forEach(issue => console.log(issue));
    console.log('\n🔧 Correction...\n');

    await prisma.user.update({
      where: { id: superAdmin.id },
      data: {
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
        isActive: true,
        isVerified: true,
      },
    });

    console.log('✅ Super Admin corrigé!\n');
  } else {
    console.log('✅ Tout est correct!\n');
  }

  // Test de connexion simulé
  console.log('🧪 Simulation de la réponse de login:\n');
  const { password, ...sanitized } = superAdmin;
  console.log(JSON.stringify(sanitized, null, 2));
  console.log('\n');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
