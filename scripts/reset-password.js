const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetPassword() {
  try {
    // Trouver le super admin
    const superAdmin = await prisma.user.findFirst({
      where: { isSuperAdmin: true }
    });

    if (!superAdmin) {
      console.log('❌ Aucun super admin trouvé');
      process.exit(1);
    }

    console.log('\n📧 Super Admin trouvé:');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Téléphone: ${superAdmin.phone}`);
    console.log(`   Nom: ${superAdmin.firstName} ${superAdmin.lastName}`);

    rl.question('\n🔑 Entrez le nouveau mot de passe: ', async (newPassword) => {
      if (!newPassword || newPassword.length < 6) {
        console.log('❌ Le mot de passe doit contenir au moins 6 caractères');
        rl.close();
        process.exit(1);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { password: hashedPassword }
      });

      console.log('\n✅ Mot de passe mis à jour avec succès!');
      console.log(`\n📝 Identifiants de connexion:`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Mot de passe: ${newPassword}`);
      
      rl.close();
      await prisma.$disconnect();
    });

  } catch (error) {
    console.error('Erreur:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();
