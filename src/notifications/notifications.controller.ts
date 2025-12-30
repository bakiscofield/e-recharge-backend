import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir mes notifications' })
  async findAll(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('onlyUnread') onlyUnread?: string,
  ) {
    return this.notificationsService.findAll(
      user.id,
      limit ? parseInt(limit) : undefined,
      onlyUnread === 'true',
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtenir le nombre de notifications non lues' })
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Post('push/subscribe')
  @ApiOperation({ summary: 'S\'abonner aux notifications push' })
  async subscribePush(@CurrentUser() user: any, @Body() subscription: any) {
    return this.notificationsService.subscribePush(user.id, subscription);
  }

  @Delete('push/unsubscribe')
  @ApiOperation({ summary: 'Se désabonner des notifications push' })
  async unsubscribePush(
    @CurrentUser() user: any,
    @Body('endpoint') endpoint: string,
  ) {
    return this.notificationsService.unsubscribePush(user.id, endpoint);
  }

  @Post('subscribe-fcm')
  @ApiOperation({ summary: 'S\'abonner aux notifications FCM (Firebase Cloud Messaging)' })
  async subscribeFcm(
    @CurrentUser() user: any,
    @Body() dto: {
      token: string;
      deviceType: 'WEB' | 'ANDROID' | 'IOS';
      deviceId?: string;
      userAgent?: string;
    },
  ) {
    return this.notificationsService.subscribeFcm(user.id, dto);
  }

  @Post('unsubscribe-fcm')
  @ApiOperation({ summary: 'Se désabonner des notifications FCM' })
  async unsubscribeFcm(
    @CurrentUser() user: any,
    @Body('token') token: string,
  ) {
    return this.notificationsService.unsubscribeFcm(user.id, token);
  }

  @Delete('fcm-token/:token')
  @ApiOperation({ summary: 'Supprimer un token FCM spécifique' })
  async deleteFcmToken(
    @CurrentUser() user: any,
    @Param('token') token: string,
  ) {
    return this.notificationsService.unsubscribeFcm(user.id, token);
  }

  @Post('test')
  @ApiOperation({ summary: 'Envoyer une notification de test (Super Admin uniquement)' })
  async sendTestNotification(
    @CurrentUser() user: any,
    @Body() dto?: { userId?: string; title?: string; body?: string },
  ) {
    // Vérifier que l'utilisateur est super admin
    if (!user.isSuperAdmin) {
      throw new Error('Accès refusé : Super Admin uniquement');
    }

    // Utiliser l'userId fourni ou celui de l'utilisateur connecté
    const targetUserId = dto?.userId || user.id;
    const title = dto?.title || '🧪 Test de notification';
    const body = dto?.body || `Notification de test envoyée à ${new Date().toLocaleTimeString('fr-FR')}`;

    return this.notificationsService.create({
      userId: targetUserId,
      type: 'TEST_NOTIFICATION',
      title,
      body,
      data: JSON.stringify({
        timestamp: new Date().toISOString(),
        sentBy: user.id,
      }),
    });
  }
}
