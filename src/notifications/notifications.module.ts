import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { WebPushService } from './web-push.service';
import { EmailService } from './email.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, WebPushService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
