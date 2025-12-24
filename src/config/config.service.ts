import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppConfigService {
  constructor(private prisma: PrismaService) {}

  async getPublicConfig() {
    const configs = await this.prisma.appConfig.findMany();

    const result: any = {};
    for (const config of configs) {
      try {
        result[config.key] = JSON.parse(config.value);
      } catch {
        result[config.key] = config.value;
      }
    }

    return result;
  }

  async get(key: string) {
    const config = await this.prisma.appConfig.findUnique({
      where: { key },
    });

    if (!config) return null;

    try {
      return JSON.parse(config.value);
    } catch {
      return config.value;
    }
  }

  async set(key: string, value: any, category?: string, description?: string) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    return this.prisma.appConfig.upsert({
      where: { key },
      create: {
        key,
        value: stringValue,
        category: category || 'general',
        description,
      },
      update: {
        value: stringValue,
        category: category || undefined,
        description: description || undefined,
      },
    });
  }

  async delete(key: string) {
    return this.prisma.appConfig.delete({
      where: { key },
    });
  }

  async getByCategory(category: string) {
    const configs = await this.prisma.appConfig.findMany({
      where: { category },
    });

    const result: any = {};
    for (const config of configs) {
      try {
        result[config.key] = JSON.parse(config.value);
      } catch {
        result[config.key] = config.value;
      }
    }

    return result;
  }

  async updateBranding(branding: {
    appName?: string;
    appTagline?: string;
    appLogo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }) {
    const updates: Promise<any>[] = [];

    if (branding.appName !== undefined) {
      updates.push(this.set('appName', branding.appName, 'branding', 'Nom de l\'application'));
    }

    if (branding.appTagline !== undefined) {
      updates.push(this.set('appTagline', branding.appTagline, 'branding', 'Slogan de l\'application'));
    }

    if (branding.appLogo !== undefined) {
      updates.push(this.set('appLogo', branding.appLogo, 'branding', 'URL du logo'));
    }

    if (branding.favicon !== undefined) {
      updates.push(this.set('favicon', branding.favicon, 'branding', 'URL du favicon'));
    }

    if (branding.primaryColor !== undefined) {
      updates.push(this.set('primaryColor', branding.primaryColor, 'branding', 'Couleur principale'));
    }

    if (branding.secondaryColor !== undefined) {
      updates.push(this.set('secondaryColor', branding.secondaryColor, 'branding', 'Couleur secondaire'));
    }

    await Promise.all(updates);

    return this.getPublicConfig();
  }
}
