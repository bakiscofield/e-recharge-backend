#!/bin/bash

# Script rapide pour supprimer tous les agents
# ⚠️ ATTENTION: Opération destructive !

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⚠️  SUPPRESSION DE TOUS LES AGENTS ⚠️${NC}\n"

# Obtenir le chemin du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Créer le script Node.js dans le dossier du projet
cat > "$PROJECT_DIR/.delete-agents-temp.js" << 'ENDOFSCRIPT'
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
    // Compter les agents
    const count = await prisma.user.count({
      where: { role: 'AGENT' }
    });

    if (count === 0) {
      console.log('✅ Aucun agent à supprimer');
      return;
    }

    // Afficher les agents
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        email: true,
        phone: true,
        firstName: true,
        lastName: true
      }
    });

    console.log(`\n📋 ${count} agent(s) trouvé(s):\n`);
    agents.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.email} - ${agent.phone} - ${agent.firstName} ${agent.lastName}`);
    });

    // Supprimer
    const result = await prisma.user.deleteMany({
      where: { role: 'AGENT' }
    });

    console.log(`\n✅ ${result.count} agent(s) supprimé(s) avec succès`);

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
echo -e "${YELLOW}Cette action va supprimer TOUS les agents de la base de données.${NC}"
echo -e "${RED}Cette action est IRRÉVERSIBLE !${NC}\n"
read -p "Tapez 'SUPPRIMER' en majuscules pour confirmer: " confirmation

if [ "$confirmation" != "SUPPRIMER" ]; then
    echo -e "\n${GREEN}❌ Suppression annulée${NC}\n"
    rm "$PROJECT_DIR/.delete-agents-temp.js"
    exit 0
fi

# Exécuter le script
cd "$PROJECT_DIR"
node .delete-agents-temp.js

# Nettoyer
rm "$PROJECT_DIR/.delete-agents-temp.js"
