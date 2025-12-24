import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ThemeConfigData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  textSecondary?: string;
  glowIntensity?: number;
  animationSpeed?: number;
  particlesEnabled?: boolean;
  gradientEnabled?: boolean;
  moneyAnimationStyle?: string;
  moneyColor?: string;
  moneyGlow?: boolean;
  logoAnimationType?: string;
  logoGlowColor?: string;
  backgroundType?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  fontFamily?: string;
  fontSizeBase?: number;
  borderRadius?: number;
  borderGlow?: boolean;
}

@Injectable()
export class ThemeService {
  constructor(private prisma: PrismaService) {}

  async getActiveTheme() {
    const theme = await this.prisma.themeConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    // Si pas de thème actif, créer un thème par défaut
    if (!theme) {
      return this.createDefaultTheme();
    }

    return theme;
  }

  async createDefaultTheme() {
    // Désactiver tous les thèmes existants
    await this.prisma.themeConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return this.prisma.themeConfig.create({
      data: {
        isActive: true,
      },
    });
  }

  async updateTheme(data: ThemeConfigData) {
    const theme = await this.getActiveTheme();

    return this.prisma.themeConfig.update({
      where: { id: theme.id },
      data: {
        ...data,
        version: theme.version + 1,
      },
    });
  }

  async getAllThemes() {
    return this.prisma.themeConfig.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createTheme(data: ThemeConfigData) {
    return this.prisma.themeConfig.create({
      data: {
        ...data,
        isActive: false,
      },
    });
  }

  async activateTheme(id: string) {
    const theme = await this.prisma.themeConfig.findUnique({ where: { id } });
    if (!theme) {
      throw new NotFoundException('Thème introuvable');
    }

    // Désactiver tous les thèmes
    await this.prisma.themeConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activer le thème sélectionné
    return this.prisma.themeConfig.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deleteTheme(id: string) {
    const theme = await this.prisma.themeConfig.findUnique({ where: { id } });
    if (!theme) {
      throw new NotFoundException('Thème introuvable');
    }

    if (theme.isActive) {
      throw new Error('Impossible de supprimer le thème actif');
    }

    return this.prisma.themeConfig.delete({ where: { id } });
  }

  // ==================== UI COMPONENTS ====================

  async getUIComponent(componentType: string) {
    return this.prisma.uIComponentConfig.findUnique({
      where: { componentType },
    });
  }

  async getAllUIComponents() {
    return this.prisma.uIComponentConfig.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getVisibleUIComponents(country?: string, role?: string) {
    const components = await this.prisma.uIComponentConfig.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
    });

    // Filtrer par pays et rôle
    return components.filter(component => {
      let matchCountry = true;
      let matchRole = true;

      if (component.showForCountries && country) {
        const countries = JSON.parse(component.showForCountries);
        matchCountry = countries.includes(country);
      }

      if (component.showForRoles && role) {
        const roles = JSON.parse(component.showForRoles);
        matchRole = roles.includes(role);
      }

      return matchCountry && matchRole;
    });
  }

  async updateUIComponent(componentType: string, data: {
    componentName?: string;
    config?: any;
    isVisible?: boolean;
    order?: number;
    showForCountries?: string[];
    showForRoles?: string[];
  }) {
    const existing = await this.prisma.uIComponentConfig.findUnique({
      where: { componentType },
    });

    const updateData: any = {};
    if (data.componentName) updateData.componentName = data.componentName;
    if (data.config) updateData.config = JSON.stringify(data.config);
    if (data.isVisible !== undefined) updateData.isVisible = data.isVisible;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.showForCountries) updateData.showForCountries = JSON.stringify(data.showForCountries);
    if (data.showForRoles) updateData.showForRoles = JSON.stringify(data.showForRoles);

    if (existing) {
      return this.prisma.uIComponentConfig.update({
        where: { componentType },
        data: updateData,
      });
    } else {
      return this.prisma.uIComponentConfig.create({
        data: {
          componentType,
          componentName: data.componentName || componentType,
          config: JSON.stringify(data.config || {}),
          ...updateData,
        },
      });
    }
  }

  async deleteUIComponent(componentType: string) {
    return this.prisma.uIComponentConfig.delete({
      where: { componentType },
    });
  }
}
