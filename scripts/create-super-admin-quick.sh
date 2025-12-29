#!/bin/bash

# Script rapide pour créer un super admin avec des valeurs par défaut
# Usage: ./create-super-admin-quick.sh [email] [phone] [password]

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Valeurs par défaut ou depuis les arguments
EMAIL="${1:-superadmin@alicebot.com}"
PHONE="${2:-90000000}"
PASSWORD="${3:-SuperAdmin2024!}"
FIRSTNAME="${4:-Super}"
LASTNAME="${5:-Admin}"
COUNTRY="${6:-TG}"

echo -e "${YELLOW}=== CRÉATION RAPIDE D'UN SUPER ADMIN ===${NC}\n"

# Obtenir le chemin du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Créer le script Node.js dans le dossier du projet
cat > "$PROJECT_DIR/.create-super-admin-temp.js" << 'ENDOFSCRIPT'
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./production.db'
    }
  }
});

const [email, phone, password, firstName, lastName, country] = process.argv.slice(2);

async function generateUniqueReferralCode() {
  let code = '';
  let exists = true;
  while (exists) {
    code = Array.from({length: 5}, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');
    const user = await prisma.user.findUnique({ where: { referralCode: code } });
    exists = !!user;
  }
  return code;
}

async function main() {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      console.log('❌ Utilisateur existant trouvé - Mise à jour...');
      const hashedPassword = await bcrypt.hash(password, 10);
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          isActive: true,
          isVerified: true,
          emailVerified: true
        }
      });
      console.log(`✅ Utilisateur mis à jour: ${updated.email}`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const referralCode = await generateUniqueReferralCode();

      const superAdmin = await prisma.user.create({
        data: {
          email, phone, password: hashedPassword,
          firstName, lastName, country,
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
          isActive: true,
          isVerified: true,
          emailVerified: true,
          referralCode
        }
      });
      console.log(`✅ Super Admin créé: ${superAdmin.email}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
ENDOFSCRIPT

# Exécuter le script depuis le dossier du projet
cd "$PROJECT_DIR"
node .create-super-admin-temp.js "$EMAIL" "$PHONE" "$PASSWORD" "$FIRSTNAME" "$LASTNAME" "$COUNTRY"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Informations de connexion:${NC}"
    echo "   Email:       $EMAIL"
    echo "   Téléphone:   $PHONE"
    echo "   Mot de passe: $PASSWORD"
    echo ""
fi

# Nettoyer
rm "$PROJECT_DIR/.create-super-admin-temp.js"
