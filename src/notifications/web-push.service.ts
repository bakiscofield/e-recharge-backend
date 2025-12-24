import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';

@Injectable()
export class WebPushService {
  constructor() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || 'mailto:admin@alicebot.com';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      console.warn('⚠️  VAPID keys not configured - push notifications disabled');
    }
  }

  async sendNotification(subscription: any, payload: any) {
    return webpush.sendNotification(subscription, JSON.stringify(payload));
  }
}
