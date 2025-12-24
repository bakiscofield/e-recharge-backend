import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async sendOtp(phone: string, code: string): Promise<void> {
    const provider = process.env.SMS_PROVIDER || 'console';

    // En dev, afficher dans la console
    if (process.env.NODE_ENV === 'development' || provider === 'console') {
      console.log('📱 SMS OTP:', { phone, code });
      return;
    }

    // Production : intégrer Twilio, AfricasTalking, etc.
    // Exemple avec AfricasTalking (à adapter selon le provider)
    /*
    const AfricasTalking = require('africastalking')({
      apiKey: process.env.SMS_API_KEY,
      username: process.env.SMS_API_SECRET,
    });

    const sms = AfricasTalking.SMS;
    await sms.send({
      to: [phone],
      message: `Votre code AliceBot: ${code}`,
      from: process.env.SMS_SENDER_ID,
    });
    */

    console.log('SMS would be sent:', { phone, code });
  }
}
