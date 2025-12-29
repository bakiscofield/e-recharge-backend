const bcrypt = require('bcrypt');
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

async function main() {
  console.log('\n=== CRÉATION D\'UN SUPER ADMIN ===\n');

  try {
    // Demander les informations
    const email = await question('Email: ');
    const phone = await question('Téléphone (ex: 90000001): ');
    const password = await question('Mot de passe: ');
    const firstName = await question('Prénom: ');
    const lastName = await question('Nom: ');
    const country = await question('Pays (TG, BJ, CI, etc.): ');

    console.log('\n📋 Résumé:');
    console.log('------------------------------------');
    console.log(`Email:      ${email}`);
    console.log(`Téléphone:  ${phone}`);
    console.log(`Nom:        ${firstName} ${lastName}`);
    console.log(`Pays:       ${country}`);
    console.log(`Rôle:       SUPER_ADMIN`);
    console.log('------------------------------------\n');

    const confirm = await question('Confirmer la création ? (oui/non): ');

    if (confirm.toLowerCase() !== 'oui') {
      console.log('\n❌ Création annulée\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Vérifier si l'email ou le téléphone existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      console.log('\n❌ Erreur: Un utilisateur avec cet email ou téléphone existe déjà\n');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Hash du mot de passe
    console.log('\n🔐 Génération du hash du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générer un code de parrainage unique
    const referralCode = await generateUniqueReferralCode();

    // Créer le super admin
    console.log('👤 Création du super admin...');
    const superAdmin = await prisma.user.create({
      data: {
        email: email,
        phone: phone,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        country: country,
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        referralCode: referralCode
      }
    });

    console.log('\n✅✅✅ SUPER ADMIN CRÉÉ AVEC SUCCÈS ✅✅✅\n');
    console.log('📋 Informations de connexion:');
    console.log('------------------------------------');
    console.log(`ID:         ${superAdmin.id}`);
    console.log(`Email:      ${superAdmin.email}`);
    console.log(`Téléphone:  ${superAdmin.phone}`);
    console.log(`Nom:        ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`Rôle:       ${superAdmin.role}`);
    console.log(`Code promo: ${superAdmin.referralCode}`);
    console.log('------------------------------------\n');

    console.log('🔑 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Email/Téléphone: ${email} ou ${phone}`);
    console.log(`   Mot de passe:    ${password}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Générer un code de parrainage unique
async function generateUniqueReferralCode() {
  let code = '';
  let exists = true;

  while (exists) {
    code = generateRandomCode(5);
    const user = await prisma.user.findUnique({
      where: { referralCode: code }
    });
    exists = !!user;
  }

  return code;
}

function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

main();
