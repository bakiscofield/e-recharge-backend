import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookmakersModule } from './bookmakers/bookmakers.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { OrdersModule } from './orders/orders.module';
import { ReferralModule } from './referral/referral.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppConfigModule } from './config/config.module';
import { AdminModule } from './admin/admin.module';
import { RBACModule } from './rbac/rbac.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { ThemeModule } from './theme/theme.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { UploadModule } from './upload/upload.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60'),
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    BookmakersModule,
    PaymentMethodsModule,
    OrdersModule,
    ReferralModule,
    ChatModule,
    NotificationsModule,
    AppConfigModule,
    AdminModule,
    RBACModule,
    SuperAdminModule,
    ThemeModule,
    NewsletterModule,
    UploadModule,
    AnnouncementsModule,
    CouponsModule,
  ],
})
export class AppModule {}
