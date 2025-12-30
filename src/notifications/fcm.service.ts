import { Injectable } from '@nestjs/common';
import { getMessaging, isFirebaseConfigured } from '../config/firebase.config';
import * as admin from 'firebase-admin';

interface FcmPayload {
  notification?: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
  };
  data?: { [key: string]: string };
  webpush?: {
    fcmOptions?: {
      link?: string;
    };
    notification?: {
      icon?: string;
      badge?: string;
    };
  };
}

interface SendResult {
  success: boolean;
  invalidTokens: string[];
  failedTokens: string[];
  successCount: number;
}

@Injectable()
export class FcmService {
  private messaging: admin.messaging.Messaging | null;

  constructor() {
    this.messaging = getMessaging();

    if (!this.messaging) {
      console.warn('⚠️  FCM Service initialized without Firebase configuration');
    } else {
      console.log('✅ FCM Service initialized successfully');
    }
  }

  /**
   * Envoyer une notification à un seul token FCM
   * @param token Token FCM du destinataire
   * @param payload Contenu de la notification
   * @returns Promise<boolean> true si envoyé avec succès
   */
  async sendNotification(token: string, payload: FcmPayload): Promise<boolean> {
    if (!this.messaging || !isFirebaseConfigured()) {
      console.warn('⚠️  FCM not configured, skipping notification');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: payload.notification,
        data: payload.data || {},
        webpush: payload.webpush || {
          fcmOptions: {
            link: payload.data?.url || '/',
          },
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log('✅ FCM notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('❌ Error sending FCM notification:', error);

      // Gérer les codes d'erreur spécifiques
      if (error.code === 'messaging/invalid-registration-token') {
        console.log('⚠️  Invalid token, should be removed:', token);
        return false;
      } else if (error.code === 'messaging/registration-token-not-registered') {
        console.log('⚠️  Token not registered, should be removed:', token);
        return false;
      }

      return false;
    }
  }

  /**
   * Envoyer une notification à plusieurs tokens en batch (max 500)
   * @param tokens Liste des tokens FCM
   * @param payload Contenu de la notification
   * @returns Promise<SendResult> Résultat avec tokens invalides
   */
  async sendMulticast(tokens: string[], payload: FcmPayload): Promise<SendResult> {
    if (!this.messaging || !isFirebaseConfigured()) {
      console.warn('⚠️  FCM not configured, skipping multicast notification');
      return {
        success: false,
        invalidTokens: [],
        failedTokens: [],
        successCount: 0,
      };
    }

    if (tokens.length === 0) {
      return {
        success: true,
        invalidTokens: [],
        failedTokens: [],
        successCount: 0,
      };
    }

    try {
      // Firebase limite à 500 tokens par appel
      const batches: string[][] = [];
      for (let i = 0; i < tokens.length; i += 500) {
        batches.push(tokens.slice(i, i + 500));
      }

      const invalidTokens: string[] = [];
      const failedTokens: string[] = [];
      let totalSuccess = 0;

      for (const batch of batches) {
        const message: admin.messaging.MulticastMessage = {
          tokens: batch,
          notification: payload.notification,
          data: payload.data || {},
          webpush: payload.webpush || {
            fcmOptions: {
              link: payload.data?.url || '/',
            },
            notification: {
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-96x96.png',
            },
          },
        };

        const response = await this.messaging.sendEachForMulticast(message);
        totalSuccess += response.successCount;

        console.log(`✅ FCM multicast: ${response.successCount}/${batch.length} sent`);

        // Identifier les tokens invalides
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const token = batch[idx];
            const error = resp.error;

            if (
              error?.code === 'messaging/invalid-registration-token' ||
              error?.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(token);
            } else {
              failedTokens.push(token);
            }
          }
        });
      }

      return {
        success: true,
        invalidTokens,
        failedTokens,
        successCount: totalSuccess,
      };
    } catch (error) {
      console.error('❌ Error sending FCM multicast:', error);
      return {
        success: false,
        invalidTokens: [],
        failedTokens: tokens,
        successCount: 0,
      };
    }
  }

  /**
   * Envoyer une notification à un topic
   * @param topic Nom du topic
   * @param payload Contenu de la notification
   * @returns Promise<boolean> true si envoyé avec succès
   */
  async sendToTopic(topic: string, payload: FcmPayload): Promise<boolean> {
    if (!this.messaging || !isFirebaseConfigured()) {
      console.warn('⚠️  FCM not configured, skipping topic notification');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: payload.notification,
        data: payload.data || {},
        webpush: payload.webpush || {
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
          },
        },
      };

      const response = await this.messaging.send(message);
      console.log('✅ FCM topic notification sent:', response);
      return true;
    } catch (error) {
      console.error('❌ Error sending FCM topic notification:', error);
      return false;
    }
  }

  /**
   * Abonner des tokens à un topic
   * @param tokens Liste des tokens
   * @param topic Nom du topic
   * @returns Promise<boolean> true si succès
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.messaging || !isFirebaseConfigured()) {
      console.warn('⚠️  FCM not configured, skipping topic subscription');
      return false;
    }

    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log(`✅ Subscribed ${response.successCount} tokens to topic ${topic}`);
      return true;
    } catch (error) {
      console.error('❌ Error subscribing to topic:', error);
      return false;
    }
  }

  /**
   * Désabonner des tokens d'un topic
   * @param tokens Liste des tokens
   * @param topic Nom du topic
   * @returns Promise<boolean> true si succès
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    if (!this.messaging || !isFirebaseConfigured()) {
      console.warn('⚠️  FCM not configured, skipping topic unsubscription');
      return false;
    }

    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log(`✅ Unsubscribed ${response.successCount} tokens from topic ${topic}`);
      return true;
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', error);
      return false;
    }
  }

  /**
   * Valider un token FCM
   * @param token Token à valider
   * @returns Promise<boolean> true si valide
   */
  async validateToken(token: string): Promise<boolean> {
    if (!this.messaging || !isFirebaseConfigured()) {
      return false;
    }

    try {
      // Envoyer un message de test "dry run"
      const message: admin.messaging.Message = {
        token,
        data: { test: 'validation' },
      };

      await this.messaging.send(message, true); // dry run mode
      return true;
    } catch (error) {
      console.warn('⚠️  Invalid FCM token:', token);
      return false;
    }
  }

  /**
   * Vérifier si FCM est configuré
   * @returns boolean
   */
  isConfigured(): boolean {
    return isFirebaseConfigured() && this.messaging !== null;
  }
}
