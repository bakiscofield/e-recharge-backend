import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    } else {
      console.warn('⚠️  SMTP not configured - email notifications disabled');
    }
  }

  async send(options: { to: string; subject: string; html: string }) {
    if (!this.transporter) {
      console.log('📧 Email (not sent):', options);
      return;
    }

    const fromName = process.env.SMTP_FROM_NAME || 'AliceBot';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    await this.transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async sendEmailVerificationCode(email: string, code: string) {
    const appName = process.env.APP_NAME || 'AliceBot';
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenue sur ${appName}!</h2>
        
        <p style="color: #666; font-size: 16px;">
          Merci de vous être inscrit. Veuillez utiliser le code ci-dessous pour vérifier votre adresse email:
        </p>
        
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <div style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 5px;">
            ${code}
          </div>
        </div>
        
        <p style="color: #999; font-size: 14px;">
          Ce code expirera dans <strong>15 minutes</strong>.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Si vous n'avez pas demandé cet email, veuillez l'ignorer.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} ${appName}. Tous droits réservés.
        </p>
      </div>
    `;

    await this.send({
      to: email,
      subject: `Code de vérification: ${code}`,
      html,
    });
  }
}
