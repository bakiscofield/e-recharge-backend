import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Orders
  { code: 'orders.view', name: 'Voir les commandes', category: 'orders', description: 'Permet de voir toutes les commandes' },
  { code: 'orders.validate', name: 'Valider les commandes', category: 'orders', description: 'Permet de valider les dépôts' },
  { code: 'orders.reject', name: 'Rejeter les commandes', category: 'orders', description: 'Permet de rejeter les dépôts' },
  { code: 'orders.delete', name: 'Supprimer les commandes', category: 'orders', description: 'Permet de supprimer des commandes' },

  // Users
  { code: 'users.view', name: 'Voir les utilisateurs', category: 'users', description: 'Permet de voir la liste des utilisateurs' },
  { code: 'users.edit', name: 'Modifier les utilisateurs', category: 'users', description: 'Permet de modifier les profils utilisateurs' },
  { code: 'users.ban', name: 'Bannir les utilisateurs', category: 'users', description: 'Permet de désactiver des comptes' },
  { code: 'users.delete', name: 'Supprimer les utilisateurs', category: 'users', description: 'Permet de supprimer des comptes' },

  // Bookmakers
  { code: 'bookmakers.view', name: 'Voir les bookmakers', category: 'bookmakers', description: 'Permet de voir les bookmakers' },
  { code: 'bookmakers.create', name: 'Créer des bookmakers', category: 'bookmakers', description: 'Permet d\'ajouter des bookmakers' },
  { code: 'bookmakers.edit', name: 'Modifier les bookmakers', category: 'bookmakers', description: 'Permet de modifier les bookmakers' },
  { code: 'bookmakers.delete', name: 'Supprimer les bookmakers', category: 'bookmakers', description: 'Permet de supprimer des bookmakers' },

  // Payment Methods
  { code: 'payment-methods.view', name: 'Voir les moyens de paiement', category: 'payment-methods', description: 'Permet de voir les moyens de paiement' },
  { code: 'payment-methods.create', name: 'Créer des moyens de paiement', category: 'payment-methods', description: 'Permet d\'ajouter des moyens de paiement' },
  { code: 'payment-methods.edit', name: 'Modifier les moyens de paiement', category: 'payment-methods', description: 'Permet de modifier les moyens de paiement' },
  { code: 'payment-methods.delete', name: 'Supprimer les moyens de paiement', category: 'payment-methods', description: 'Permet de supprimer des moyens de paiement' },

  // Config
  { code: 'config.view', name: 'Voir la configuration', category: 'config', description: 'Permet de voir les paramètres' },
  { code: 'config.edit', name: 'Modifier la configuration', category: 'config', description: 'Permet de modifier les paramètres' },
  { code: 'config.theme.view', name: 'Voir le thème', category: 'config.theme', description: 'Permet de voir le thème actif' },
  { code: 'config.theme.edit', name: 'Modifier le thème', category: 'config.theme', description: 'Permet de personnaliser le thème' },
  { code: 'config.ui.view', name: 'Voir les composants UI', category: 'config.ui', description: 'Permet de voir les composants' },
  { code: 'config.ui.edit', name: 'Modifier les composants UI', category: 'config.ui', description: 'Permet de configurer les composants' },

  // Newsletters
  { code: 'newsletters.view', name: 'Voir les newsletters', category: 'newsletters', description: 'Permet de voir les newsletters' },
  { code: 'newsletters.create', name: 'Créer des newsletters', category: 'newsletters', description: 'Permet de créer des newsletters' },
  { code: 'newsletters.edit', name: 'Modifier les newsletters', category: 'newsletters', description: 'Permet de modifier des newsletters' },
  { code: 'newsletters.publish', name: 'Publier les newsletters', category: 'newsletters', description: 'Permet de publier des newsletters' },
  { code: 'newsletters.delete', name: 'Supprimer les newsletters', category: 'newsletters', description: 'Permet de supprimer des newsletters' },

  // Chat
  { code: 'chat.view', name: 'Voir le chat', category: 'chat', description: 'Permet de voir les conversations' },
  { code: 'chat.moderate', name: 'Modérer le chat', category: 'chat', description: 'Permet de modérer les messages' },
  { code: 'chat.delete', name: 'Supprimer des messages', category: 'chat', description: 'Permet de supprimer des messages' },

  // Roles
  { code: 'roles.view', name: 'Voir les rôles', category: 'roles', description: 'Permet de voir les rôles' },

  // Permissions
  { code: 'permissions.view', name: 'Voir les permissions', category: 'permissions', description: 'Permet de voir les permissions' },

  // Agents
  { code: 'agents.view', name: 'Voir les agents', category: 'agents', description: 'Permet de voir les agents/caissiers' },
  { code: 'agents.create', name: 'Créer des agents', category: 'agents', description: 'Permet de créer des agents/caissiers' },
  { code: 'agents.edit', name: 'Modifier les agents', category: 'agents', description: 'Permet de modifier les agents/caissiers' },
  { code: 'agents.delete', name: 'Supprimer les agents', category: 'agents', description: 'Permet de supprimer des agents/caissiers' },
];

async function main() {
  console.log('🔧 Initialisation des permissions...\n');

  let created = 0;
  let existing = 0;

  for (const permission of permissions) {
    const existingPermission = await prisma.permission.findUnique({
      where: { code: permission.code },
    });

    if (!existingPermission) {
      await prisma.permission.create({ data: permission });
      console.log(`✅ Permission créée: ${permission.code}`);
      created++;
    } else {
      console.log(`⏭️  Permission existe déjà: ${permission.code}`);
      existing++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ${created} permissions créées`);
  console.log(`⏭️  ${existing} permissions existantes`);
  console.log(`📊 Total: ${permissions.length} permissions`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
