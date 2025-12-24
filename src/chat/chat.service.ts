import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(
    clientId: string,
    agentId?: string,
    type: string = 'SUPPORT',
  ) {
    let conversation = await this.prisma.chatConversation.findFirst({
      where: {
        clientId,
        agentId: agentId || null,
        type,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.chatConversation.create({
        data: {
          clientId,
          agentId,
          type,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });
    }

    return conversation;
  }

  async getConversations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return [];

    const where: any = {};

    if (user.role === 'CLIENT') {
      where.clientId = userId;
    } else if (user.role === 'AGENT') {
      where.agentId = userId;
    } else if (user.role === 'SUPPORT' || user.role === 'ADMIN' || user.isSuperAdmin) {
      // Les admins et super admins voient TOUTES les conversations
      // Pas de filtre sur agentId
    }

    return this.prisma.chatConversation.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Les admins peuvent accéder à toutes les conversations
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPPORT' || user.isSuperAdmin;

    const where: any = { id: conversationId };

    if (!isAdmin) {
      // Pour les clients et agents, filtrer par leur ID
      where.OR = [{ clientId: userId }, { agentId: userId }];
    }

    const conversation = await this.prisma.chatConversation.findFirst({
      where,
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachmentUrl?: string,
  ) {
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        content,
        attachmentUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
