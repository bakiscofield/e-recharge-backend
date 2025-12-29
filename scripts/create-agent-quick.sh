#!/bin/bash

# Script rapide pour créer un agent/caissier
# Usage: ./create-agent-quick.sh [email] [phone] [password] [firstname] [lastname] [country]

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Valeurs par défaut ou depuis les arguments
EMAIL="${1:-agent@alicebot.com}"
PHONE="${2:-90111111}"
PASSWORD="${3:-Agent123!}"
FIRSTNAME="${4:-Agent}"
LASTNAME="${5:-User}"
COUNTRY="${6:-TG}"

echo -e "${YELLOW}=== CRÉATION RAPIDE D'UN AGENT ===${NC}\n"

# Obtenir le chemin du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Créer le script Node.js dans le dossier du projet
cat > "$PROJECT_DIR/.create-agent-temp.js" << 'ENDOFSCRIPT'
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
          role: 'AGENT',
          isSuperAdmin: false,
          isActive: true,
          isVerified: true,
          emailVerified: true
        }
      });
      console.log(`✅ Utilisateur mis à jour: ${updated.email} (${updated.role})`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const referralCode = await generateUniqueReferralCode();

      const agent = await prisma.user.create({
        data: {
          email, phone, password: hashedPassword,
          firstName, lastName, country,
          role: 'AGENT',
          isSuperAdmin: false,
          isActive: true,
          isVerified: true,
          emailVerified: true,
          referralCode
        }
      });
      console.log(`✅ Agent créé: ${agent.email}`);
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
node .create-agent-temp.js "$EMAIL" "$PHONE" "$PASSWORD" "$FIRSTNAME" "$LASTNAME" "$COUNTRY"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Informations de connexion:${NC}"
    echo "   Rôle:        AGENT"
    echo "   Email:       $EMAIL"
    echo "   Téléphone:   $PHONE"
    echo "   Mot de passe: $PASSWORD"
    echo ""
fi

# Nettoyer
rm "$PROJECT_DIR/.create-agent-temp.js"
