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

  // ==================== INFO PAGE CONTENT ====================

  async getInfoPageContent() {
    const content = await this.get('infoPageContent');

    // Retourner le contenu par défaut si aucun n'est configuré
    if (!content) {
      return {
        whatsapp: '+228 90 12 34 56',
        whatsappLink: 'https://wa.me/22890123456',
        phone: '+228 90 12 34 56',
        email: 'support@example.com',
        facebook: 'https://facebook.com/',
        twitter: 'https://twitter.com/',
        instagram: 'https://instagram.com/',
        tiktok: 'https://tiktok.com/',
        faq: [
          {
            question: 'Comment effectuer un dépôt ?',
            answer: 'Allez dans l\'onglet Dépôt, choisissez votre bookmaker, moyen de paiement et agent, puis suivez les instructions.',
          },
          {
            question: 'Quels sont les délais de traitement ?',
            answer: 'Les dépôts et retraits sont généralement traités en moins de 30 minutes.',
          },
          {
            question: 'Comment fonctionne le parrainage ?',
            answer: 'Partagez votre code parrainage. Vous recevez 5% de commission sur chaque dépôt de vos filleuls. Retrait possible à partir de 2000 FCFA.',
          },
          {
            question: 'Mes données sont-elles sécurisées ?',
            answer: 'Oui, nous utilisons des protocoles de sécurité avancés pour protéger vos informations personnelles et transactions.',
          },
        ],
        termsText: 'En utilisant notre application, vous acceptez nos conditions d\'utilisation et notre politique de confidentialité.',
        version: '1.0.0',
      };
    }

    return content;
  }

  async updateInfoPageContent(content: {
    whatsapp?: string;
    whatsappLink?: string;
    phone?: string;
    email?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    faq?: Array<{ question: string; answer: string }>;
    termsText?: string;
    version?: string;
  }) {
    // Récupérer le contenu existant
    const existing = await this.getInfoPageContent();

    // Fusionner avec les nouvelles valeurs
    const merged = {
      ...existing,
      ...content,
    };

    // Sauvegarder
    await this.set('infoPageContent', merged, 'info_page', 'Contenu de la page Informations');

    return merged;
  }
}
