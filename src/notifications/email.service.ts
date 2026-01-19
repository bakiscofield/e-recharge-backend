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
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Bienvenue sur ${appName}!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Vérification de votre adresse email</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Merci de vous être inscrit ! Pour finaliser la création de votre compte, veuillez entrer le code de vérification ci-dessous :
            </p>

            <!-- Code Box -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 16px;">
              <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 2px;">Votre code</p>
              <div style="font-size: 48px; font-weight: bold; color: #ffffff; letter-spacing: 12px; font-family: monospace;">
                ${code}
              </div>
            </div>

            <!-- Warning -->
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⏰ <strong>Attention :</strong> Ce code expirera dans <strong>15 minutes</strong>.
              </p>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #333; font-weight: 600; font-size: 14px; margin: 0 0 5px;">${appName}</p>
            <p style="color: #6c757d; font-size: 12px; margin: 0;">Votre plateforme de confiance</p>
            <p style="color: #adb5bd; font-size: 11px; margin: 15px 0 0;">
              © ${new Date().getFullYear()} ${appName}. Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: `${appName} - Code de vérification: ${code}`,
      html,
    });
  }
}
