import * as admin from 'firebase-admin';

/**
 * Configuration et initialisation de Firebase Admin SDK
 * Utilisé pour envoyer des notifications FCM (Firebase Cloud Messaging)
 */

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): admin.app.App | null {
  // Si déjà initialisé, retourner l'instance existante
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Récupérer les credentials depuis les variables d'environnement
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Vérifier que toutes les variables sont présentes
    if (!projectId || !clientEmail || !privateKey) {
      console.warn(
        '⚠️  Firebase credentials not fully configured. FCM notifications will be disabled.',
      );
      console.warn(
        'Missing:',
        !projectId ? 'FIREBASE_PROJECT_ID' : '',
        !clientEmail ? 'FIREBASE_CLIENT_EMAIL' : '',
        !privateKey ? 'FIREBASE_PRIVATE_KEY' : '',
      );
      return null;
    }

    // Remplacer les \n échappés par de vrais retours à la ligne
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    // Initialiser Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    return null;
  }
}

/**
 * Récupérer l'instance Firebase Messaging
 * @returns Instance de Firebase Messaging ou null si non initialisé
 */
export function getMessaging(): admin.messaging.Messaging | null {
  try {
    if (!firebaseApp) {
      firebaseApp = initializeFirebase();
    }

    if (!firebaseApp) {
      return null;
    }

    return admin.messaging(firebaseApp);
  } catch (error) {
    console.error('❌ Error getting Firebase Messaging instance:', error);
    return null;
  }
}

/**
 * Vérifier si Firebase est correctement configuré
 * @returns true si Firebase est initialisé et prêt
 */
export function isFirebaseConfigured(): boolean {
  return firebaseApp !== null || !!process.env.FIREBASE_PROJECT_ID;
}

// Initialiser automatiquement au chargement du module
initializeFirebase();
