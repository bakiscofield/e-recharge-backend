import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      await this.updateOnlineStatus(userId, true);
      console.log(`User ${userId} connected`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = [...this.userSockets.entries()].find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.userSockets.delete(userId);
      await this.updateOnlineStatus(userId, false);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { event: 'joined_conversation', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      content: string;
      attachmentUrl?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(
      data.conversationId,
      data.senderId,
      data.content,
      data.attachmentUrl,
    );

    // Émettre le message dans la room de la conversation
    this.server.to(`conversation:${data.conversationId}`).emit('new_message', message);

    // Vérifier si le sender est un client
    const sender = await this.prisma.user.findUnique({
      where: { id: data.senderId },
    });

    if (sender && sender.role === 'CLIENT') {
      // Récupérer tous les admins et super admins
      const admins = await this.prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'SUPPORT' },
            { isSuperAdmin: true },
          ],
        },
      });

      // Créer une notification pour chaque admin
      for (const admin of admins) {
        // Ne pas notifier l'expéditeur s'il est aussi admin (cas rare)
        if (admin.id !== data.senderId) {
          await this.notificationsService.create({
            userId: admin.id,
            type: 'NEW_MESSAGE',
            title: 'Nouveau message client',
            body: `${sender.firstName} ${sender.lastName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
            data: JSON.stringify({
              conversationId: data.conversationId,
              messageId: message.id,
              senderId: data.senderId,
            }),
          });

          // Émettre un événement WebSocket pour l'admin
          const adminSocketId = this.userSockets.get(admin.id);
          if (adminSocketId) {
            this.server.to(adminSocketId).emit('new_client_message', {
              conversation: data.conversationId,
              message,
              sender,
            });
          }
        }
      }
    } else if (
      sender &&
      (sender.role === 'ADMIN' ||
        sender.role === 'SUPPORT' ||
        sender.isSuperAdmin)
    ) {
      // Si l'expéditeur est un admin/support, notifier le client de la conversation
      const conversation = await this.prisma.chatConversation.findUnique({
        where: { id: data.conversationId },
        include: { client: true },
      });

      if (conversation && conversation.clientId !== data.senderId) {
        // Notifier le client
        await this.notificationsService.create({
          userId: conversation.clientId,
          type: 'ADMIN_REPLY',
          title: 'Réponse du support',
          body: `${sender.firstName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
          data: JSON.stringify({
            conversationId: data.conversationId,
            messageId: message.id,
            senderId: data.senderId,
          }),
        });
      }
    }

    return { event: 'message_sent', data: message };
  }

  @SubscribeMessage('mark_read')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string; userId: string },
  ) {
    await this.chatService.markAsRead(data.conversationId, data.userId);

    this.server.to(`conversation:${data.conversationId}`).emit('messages_read', {
      conversationId: data.conversationId,
      userId: data.userId,
    });

    return { event: 'marked_read' };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean },
  ) {
    this.server.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  private async updateOnlineStatus(userId: string, isOnline: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });

    this.server.emit('user_status', { userId, isOnline });
  }
}
