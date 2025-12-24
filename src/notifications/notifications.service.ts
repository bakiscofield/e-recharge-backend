import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebPushService } from './web-push.service';
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

  async findAll(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
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

  private async sendPushNotification(
    userId: string,
    payload: { title: string; body: string; data?: any },
  ) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    for (const sub of subscriptions) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: JSON.parse(sub.keys),
        };

        await this.webPushService.sendNotification(subscription, payload);
      } catch (error) {
        console.error('Push notification error:', error);
        // Supprimer si invalide
        if (error.statusCode === 410) {
          await this.prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
      }
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
