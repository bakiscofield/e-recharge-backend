import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Création du Super Admin...\n');

  // Vérifier si un Super Admin existe déjà
  const existing = await prisma.user.findFirst({
    where: { isSuperAdmin: true },
  });

  if (existing) {
    console.log('⚠️  Un Super Admin existe déjà:');
    console.log(`📧 Email: ${existing.email}`);
    console.log(`📱 Téléphone: ${existing.phone}`);
    console.log(`👤 Nom: ${existing.firstName} ${existing.lastName}\n`);

    const response = prompt('Voulez-vous en créer un autre? (y/n): ');
    if (response?.toLowerCase() !== 'y') {
      console.log('❌ Création annulée.');
      return;
    }
  }

  const hashedPassword = await bcrypt.hash('SuperAdmin2024!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@alicebot.com',
      phone: '+22670000000',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      country: 'TG',
      role: 'SUPER_ADMIN',
      isSuperAdmin: true,
      isVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Super Admin créé avec succès!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:        superadmin@alicebot.com');
  console.log('📱 Téléphone:    +22670000000');
  console.log('🔑 Mot de passe: SuperAdmin2024!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🚀 Vous pouvez maintenant vous connecter avec ces identifiants');
  console.log('🌐 Accédez au dashboard Super Admin: http://localhost:3000/super-admin\n');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
