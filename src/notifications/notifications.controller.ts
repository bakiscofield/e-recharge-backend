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
  async findAll(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.notificationsService.findAll(
      user.id,
      limit ? parseInt(limit) : undefined,
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
}
