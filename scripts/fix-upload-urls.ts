import { PrismaClient } from '@prisma/client';

/**
 * Script pour corriger les URLs des fichiers uploadés
 * Remplace http://localhost:3001 par https://back-alice.alicebot.online
 */
async function fixUploadUrls() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Recherche des annonces avec des URLs localhost...');

    // Récupérer toutes les annonces avec localhost dans l'URL
    const announcements = await prisma.announcement.findMany({
      where: {
        fileUrl: {
          contains: 'localhost',
        },
      },
    });

    console.log(`📊 ${announcements.length} annonce(s) trouvée(s) à corriger`);

    if (announcements.length === 0) {
      console.log('✅ Aucune URL à corriger');
      return;
    }

    // Corriger chaque URL
    for (const announcement of announcements) {
      const oldUrl = announcement.fileUrl;
      const newUrl = oldUrl.replace(
        'http://localhost:3001',
        'https://back-alice.alicebot.online'
      );

      await prisma.announcement.update({
        where: { id: announcement.id },
        data: { fileUrl: newUrl },
      });

      console.log(`✅ Corrigé: ${announcement.title}`);
      console.log(`   Ancienne URL: ${oldUrl}`);
      console.log(`   Nouvelle URL: ${newUrl}`);
    }

    console.log('\n✅ Toutes les URLs ont été corrigées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la correction des URLs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
fixUploadUrls()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
