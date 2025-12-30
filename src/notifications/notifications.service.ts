import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebPushService } from './web-push.service';
import { FcmService } from './fcm.service';
import { EmailService } from './email.service';

interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: string;
}

interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private webPushService: WebPushService,
    private fcmService: FcmService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: dto,
    });

    // Envoyer push notification
    await this.sendPushNotification(dto.userId, {
      title: dto.title,
      body: dto.body,
      data: dto.data ? JSON.parse(dto.data) : {},
    });

    return notification;
  }

  async findAll(userId: string, limit = 50, onlyUnread = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread && { isRead: false }), // Filtrer seulement les non lues si demandé
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async subscribePush(userId: string, subscription: any) {
    const existing = await this.prisma.pushSubscription.findFirst({
      where: {
        userId,
        endpoint: subscription.endpoint,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        keys: JSON.stringify(subscription.keys),
      },
    });
  }

  async unsubscribePush(userId: string, endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
  }

  async subscribeFcm(
    userId: string,
    tokenData: {
      token: string;
      deviceType: 'WEB' | 'ANDROID' | 'IOS';
      deviceId?: string;
      userAgent?: string;
    },
  ) {
    // Vérifier si le token existe déjà
    const existing = await this.prisma.fcmToken.findUnique({
      where: { token: tokenData.token },
    });

    if (existing) {
      // Mettre à jour lastUsedAt et s'assurer qu'il est actif
      return this.prisma.fcmToken.update({
        where: { id: existing.id },
        data: {
          lastUsedAt: new Date(),
          isActive: true,
        },
      });
    }

    // Créer nouveau token
    return this.prisma.fcmToken.create({
      data: {
        userId,
        token: tokenData.token,
        deviceType: tokenData.deviceType,
        deviceId: tokenData.deviceId,
        userAgent: tokenData.userAgent,
      },
    });
  }

  async unsubscribeFcm(userId: string, token: string) {
    return this.prisma.fcmToken.updateMany({
      where: { userId, token },
      data: { isActive: false },
    });
  }

  private async sendPushNotification(
    userId: string,
    payload: { title: string; body: string; data?: any },
  ) {
    // Stratégie de migration progressive : essayer FCM d'abord, puis Web Push

    // 1. Essayer FCM d'abord (si tokens FCM disponibles)
    const fcmTokens = await this.prisma.fcmToken.findMany({
      where: { userId, isActive: true },
    });

    if (fcmTokens.length > 0 && this.fcmService.isConfigured()) {
      console.log(`📱 Sending FCM notification to ${fcmTokens.length} tokens`);

      const tokens = fcmTokens.map((t) => t.token);

      // Préparer le payload FCM avec logo AliceBot
      const fcmPayload = {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
        },
        data: payload.data
          ? Object.fromEntries(
              Object.entries(payload.data).map(([key, value]) => [
                key,
                String(value),
              ]),
            )
          : {},
        webpush: {
          fcmOptions: {
            link: payload.data?.url || '/',
          },
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
          },
        },
      };

      try {
        const result = await this.fcmService.sendMulticast(tokens, fcmPayload);

        console.log(`✅ FCM: ${result.successCount}/${tokens.length} sent`);

        // Gérer les tokens invalides
        if (result.invalidTokens.length > 0) {
          console.log(`🗑️  Removing ${result.invalidTokens.length} invalid FCM tokens`);
          await this.prisma.fcmToken.updateMany({
            where: { token: { in: result.invalidTokens } },
            data: { isActive: false },
          });
        }

        // Si au moins un token FCM a réussi, ne pas envoyer Web Push
        if (result.successCount > 0) {
          return;
        }
      } catch (error) {
        console.error('❌ FCM notification error:', error);
        // Continuer vers Web Push en cas d'erreur FCM
      }
    }

    // 2. Fallback sur Web Push (si pas de tokens FCM ou échec FCM)
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length > 0) {
      console.log(`📧 Sending Web Push notification to ${subscriptions.length} subscriptions`);

      for (const sub of subscriptions) {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: JSON.parse(sub.keys),
          };

          await this.webPushService.sendNotification(subscription, payload);
        } catch (error) {
          console.error('❌ Web Push notification error:', error);
          // Supprimer si invalide
          if (error.statusCode === 410) {
            await this.prisma.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
        }
      }
    } else if (fcmTokens.length === 0) {
      console.log(`⚠️  No push tokens (FCM or Web Push) for user ${userId}`);
    }
  }

  async sendEmail(dto: SendEmailDto) {
    try {
      await this.emailService.send(dto);
    } catch (error) {
      console.error('Email send error:', error);
    }
  }
}
