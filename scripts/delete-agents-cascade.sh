#!/bin/bash

# Script pour supprimer tous les agents ET leurs données liées
# ⚠️ TRÈS DESTRUCTIF - Supprime commandes, conversations, etc.

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}⚠️⚠️⚠️  SUPPRESSION EN CASCADE - TRÈS DESTRUCTIF ⚠️⚠️⚠️${NC}\n"

# Obtenir le chemin du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Créer le script Node.js dans le dossier du projet
cat > "$PROJECT_DIR/.delete-agents-cascade-temp.js" << 'ENDOFSCRIPT'
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
    // Récupérer les IDs des agents
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true
      }
    });

    if (agents.length === 0) {
      console.log('✅ Aucun agent à supprimer');
      return;
    }

    const agentIds = agents.map(a => a.id);

    console.log(`\n📋 ${agents.length} agent(s) trouvé(s):\n`);
    agents.forEach((agent, index) => {
      console.log(`  ${index + 1}. ${agent.email} - ${agent.phone} - ${agent.firstName} ${agent.lastName}`);
    });

    // Compter les données liées
    const ordersCount = await prisma.order.count({
      where: {
        employeePaymentMethod: {
          employeeId: { in: agentIds }
        }
      }
    });

    const paymentsCount = await prisma.employeePaymentMethod.count({
      where: { employeeId: { in: agentIds } }
    });

    const conversationsCount = await prisma.chatConversation.count({
      where: { agentId: { in: agentIds } }
    });

    console.log(`\n⚠️  Données liées qui seront SUPPRIMÉES:`);
    console.log(`   - Commandes: ${ordersCount}`);
    console.log(`   - Méthodes de paiement: ${paymentsCount}`);
    console.log(`   - Conversations: ${conversationsCount}\n`);

    // Supprimer les données liées en premier
    console.log('🗑️  Suppression des données liées...');

    // 1. Supprimer les méthodes de paiement (supprimera aussi les commandes en cascade)
    await prisma.employeePaymentMethod.deleteMany({
      where: { employeeId: { in: agentIds } }
    });
    console.log('   ✅ Méthodes de paiement supprimées');

    // 2. Supprimer les conversations en tant qu'agent
    await prisma.chatConversation.deleteMany({
      where: { agentId: { in: agentIds } }
    });
    console.log('   ✅ Conversations supprimées');

    // 3. Supprimer les agents
    const result = await prisma.user.deleteMany({
      where: { id: { in: agentIds } }
    });

    console.log(`\n✅✅✅ ${result.count} agent(s) et leurs données supprimés avec succès ✅✅✅`);

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
echo -e "${RED}Cette action va SUPPRIMER DÉFINITIVEMENT:${NC}"
echo -e "${RED}  - Tous les agents${NC}"
echo -e "${RED}  - Toutes leurs commandes${NC}"
echo -e "${RED}  - Toutes leurs méthodes de paiement${NC}"
echo -e "${RED}  - Toutes leurs conversations${NC}"
echo -e "${YELLOW}Cette action est IRRÉVERSIBLE !${NC}\n"
echo -e "${YELLOW}💡 Conseil: Utilisez 'disable-agents-quick.sh' pour juste désactiver au lieu de supprimer${NC}\n"

read -p "Tapez 'SUPPRIMER TOUT' en majuscules pour confirmer: " confirmation

if [ "$confirmation" != "SUPPRIMER TOUT" ]; then
    echo -e "\n${GREEN}❌ Suppression annulée${NC}\n"
    rm "$PROJECT_DIR/.delete-agents-cascade-temp.js"
    exit 0
fi

# Exécuter le script
cd "$PROJECT_DIR"
node .delete-agents-cascade-temp.js

# Nettoyer
rm "$PROJECT_DIR/.delete-agents-cascade-temp.js"
