import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NewsletterData {
  title: string;
  content: string;
  imageUrl?: string;
  targetCountries?: string[];
  targetRoles?: string[];
}

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

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
}
