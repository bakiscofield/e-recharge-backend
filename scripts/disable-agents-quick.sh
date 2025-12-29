#!/bin/bash

# Script pour désactiver tous les agents (au lieu de les supprimer)
# Plus sûr que la suppression - garde l'historique

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== DÉSACTIVATION DE TOUS LES AGENTS ===${NC}\n"

# Obtenir le chemin du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Créer le script Node.js dans le dossier du projet
cat > "$PROJECT_DIR/.disable-agents-temp.js" << 'ENDOFSCRIPT'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./production.db'
    }
  }
});

async function main() {
  try {
    // Compter les agents actifs
    const count = await prisma.user.count({
      where: {
        role: 'AGENT',
        isActive: true
      }
    });

    if (count === 0) {
      console.log('✅ Aucun agent actif à désactiver');
      return;
    }

    // Afficher les agents
    const agents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isActive: true
      },
      select: {
        email: true,
        phone: true,
        firstName: true,
        lastName: true
      }
    });

    console.log(`\n📋 ${count} agent(s) actif(s):\n`);
    agents.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.email} - ${agent.phone} - ${agent.firstName} ${agent.lastName}`);
    });

    // Désactiver
    const result = await prisma.user.updateMany({
      where: {
        role: 'AGENT',
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    console.log(`\n✅ ${result.count} agent(s) désactivé(s) avec succès`);
    console.log('ℹ️  Les agents ne peuvent plus se connecter mais leurs données sont conservées');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
ENDOFSCRIPT

# Demander confirmation
echo -e "${YELLOW}Cette action va DÉSACTIVER tous les agents.${NC}"
echo -e "${GREEN}Les données des agents seront conservées.${NC}\n"
read -p "Tapez 'DESACTIVER' en majuscules pour confirmer: " confirmation

if [ "$confirmation" != "DESACTIVER" ]; then
    echo -e "\n${GREEN}❌ Désactivation annulée${NC}\n"
    rm "$PROJECT_DIR/.disable-agents-temp.js"
    exit 0
fi

# Exécuter le script
cd "$PROJECT_DIR"
node .disable-agents-temp.js

# Nettoyer
rm "$PROJECT_DIR/.disable-agents-temp.js"
