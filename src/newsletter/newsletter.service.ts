import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

export interface NewsletterData {
  title: string;
  content: string;
  imageUrl?: string;
  targetCountries?: string[];
  targetRoles?: string[];
}

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async createNewsletter(data: NewsletterData) {
    return this.prisma.newsletter.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        targetCountries: data.targetCountries ? JSON.stringify(data.targetCountries) : null,
        targetRoles: data.targetRoles ? JSON.stringify(data.targetRoles) : null,
        isDraft: true,
      },
    });
  }

  async getAllNewsletters(skip = 0, take = 20) {
    const [newsletters, total] = await Promise.all([
      this.prisma.newsletter.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletter.count(),
    ]);

    return {
      newsletters: newsletters.map(n => ({
        ...n,
        targetCountries: n.targetCountries ? JSON.parse(n.targetCountries) : null,
        targetRoles: n.targetRoles ? JSON.parse(n.targetRoles) : null,
      })),
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  async getPublishedNewsletters(country?: string, role?: string) {
    const newsletters = await this.prisma.newsletter.findMany({
      where: {
        isDraft: false,
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Filtrer par pays et rôle
    const filtered = newsletters.filter(newsletter => {
      let matchCountry = true;
      let matchRole = true;

      if (newsletter.targetCountries && country) {
        const countries = JSON.parse(newsletter.targetCountries);
        matchCountry = countries.length === 0 || countries.includes(country);
      }

      if (newsletter.targetRoles && role) {
        const roles = JSON.parse(newsletter.targetRoles);
        matchRole = roles.length === 0 || roles.includes(role);
      }

      return matchCountry && matchRole;
    });

    return filtered.map(n => ({
      ...n,
      targetCountries: n.targetCountries ? JSON.parse(n.targetCountries) : null,
      targetRoles: n.targetRoles ? JSON.parse(n.targetRoles) : null,
    }));
  }

  async getNewsletter(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      throw new NotFoundException('Newsletter introuvable');
    }

    return {
      ...newsletter,
      targetCountries: newsletter.targetCountries ? JSON.parse(newsletter.targetCountries) : null,
      targetRoles: newsletter.targetRoles ? JSON.parse(newsletter.targetRoles) : null,
    };
  }

  async updateNewsletter(id: string, data: Partial<NewsletterData>) {
    const newsletter = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new NotFoundException('Newsletter introuvable');
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.targetCountries) updateData.targetCountries = JSON.stringify(data.targetCountries);
    if (data.targetRoles) updateData.targetRoles = JSON.stringify(data.targetRoles);

    return this.prisma.newsletter.update({
      where: { id },
      data: updateData,
    });
  }

  async publishNewsletter(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new NotFoundException('Newsletter introuvable');
    }

    return this.prisma.newsletter.update({
      where: { id },
      data: {
        isDraft: false,
        publishedAt: new Date(),
      },
    });
  }

  async unpublishNewsletter(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new NotFoundException('Newsletter introuvable');
    }

    return this.prisma.newsletter.update({
      where: { id },
      data: {
        isDraft: true,
        publishedAt: null,
      },
    });
  }

  async deleteNewsletter(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new NotFoundException('Newsletter introuvable');
    }

    return this.prisma.newsletter.delete({ where: { id } });
  }

  async sendNewsletter(id: string) {
    const newsletter = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new NotFoundException('Newsletter introuvable');
    }

    if (newsletter.isDraft) {
      throw new BadRequestException('Impossible d\'envoyer une newsletter en mode brouillon. Publiez-la d\'abord.');
    }

    // Récupérer tous les utilisateurs avec email
    const whereClause: any = {
      email: { not: null },
    };

    // Filtrer par pays si spécifié
    if (newsletter.targetCountries) {
      const countries = JSON.parse(newsletter.targetCountries);
      if (countries.length > 0) {
        whereClause.country = { in: countries };
      }
    }

    // Filtrer par rôle si spécifié
    if (newsletter.targetRoles) {
      const roles = JSON.parse(newsletter.targetRoles);
      if (roles.length > 0) {
        whereClause.role = { in: roles };
      }
    }

    const subscribers = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (subscribers.length === 0) {
      throw new BadRequestException('Aucun abonné trouvé pour ce ciblage');
    }

    // Créer le HTML de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 3px solid #3b82f6;
            }
            .header h1 {
              color: #3b82f6;
              margin: 0;
            }
            .content {
              padding: 30px 0;
            }
            .content img {
              max-width: 100%;
              height: auto;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px 0;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${newsletter.title}</h1>
          </div>
          <div class="content">
            ${newsletter.imageUrl ? `<img src="${newsletter.imageUrl}" alt="${newsletter.title}">` : ''}
            <div>${newsletter.content.replace(/\n/g, '<br>')}</div>
          </div>
          <div class="footer">
            <p>Vous recevez cet email car vous êtes abonné à notre newsletter.</p>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email à tous les abonnés
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      // Skip if email is null
      if (!subscriber.email) {
        failedCount++;
        continue;
      }

      try {
        await this.emailService.send({
          to: subscriber.email,
          subject: newsletter.title,
          html: emailHtml,
        });
        sentCount++;
      } catch (error) {
        console.error(`Erreur lors de l'envoi à ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    return {
      message: 'Newsletter envoyée avec succès',
      totalSubscribers: subscribers.length,
      sentCount,
      failedCount,
    };
  }
}
