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

const ROLES = {
  '1': { role: 'SUPER_ADMIN', isSuperAdmin: true, label: 'Super Admin' },
  '2': { role: 'ADMIN', isSuperAdmin: false, label: 'Admin' },
  '3': { role: 'AGENT', isSuperAdmin: false, label: 'Agent/Caissier' },
  '4': { role: 'SUPPORT', isSuperAdmin: false, label: 'Support' },
  '5': { role: 'CLIENT', isSuperAdmin: false, label: 'Client' }
};

async function main() {
  console.log('\n=== CRÉATION D\'UN UTILISATEUR ===\n');

  try {
    // Choisir le rôle
    console.log('Choisissez le rôle:');
    Object.entries(ROLES).forEach(([key, value]) => {
      console.log(`  ${key}. ${value.label}`);
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

    console.log(`\n📋 Création d'un ${selectedRole.label}\n`);

    // Demander les informations
    const email = await question('Email: ');
    const phone = await question('Téléphone (ex: 90000001): ');
    const password = await question('Mot de passe: ');
    const firstName = await question('Prénom: ');
    const lastName = await question('Nom: ');
    const country = await question('Pays (TG, BJ, CI, etc.): ');

    console.log('\n📋 Résumé:');
    console.log('------------------------------------');
    console.log(`Rôle:       ${selectedRole.label}`);
    console.log(`Email:      ${email}`);
    console.log(`Téléphone:  ${phone}`);
    console.log(`Nom:        ${firstName} ${lastName}`);
    console.log(`Pays:       ${country}`);
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

    // Créer l'utilisateur
    console.log(`👤 Création de l'utilisateur...`);
    const user = await prisma.user.create({
      data: {
        email: email,
        phone: phone,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        country: country,
        role: selectedRole.role,
        isSuperAdmin: selectedRole.isSuperAdmin,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        referralCode: referralCode
      }
    });

    console.log('\n✅✅✅ UTILISATEUR CRÉÉ AVEC SUCCÈS ✅✅✅\n');
    console.log('📋 Informations de connexion:');
    console.log('------------------------------------');
    console.log(`ID:         ${user.id}`);
    console.log(`Rôle:       ${user.role}`);
    console.log(`Email:      ${user.email}`);
    console.log(`Téléphone:  ${user.phone}`);
    console.log(`Nom:        ${user.firstName} ${user.lastName}`);
    console.log(`Code promo: ${user.referralCode}`);
    console.log('------------------------------------\n');

    console.log('🔑 Connexion:');
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
