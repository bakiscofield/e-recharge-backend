import { Controller, Get, Put, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Config')
@Controller('config')
export class AppConfigController {
  constructor(private configService: AppConfigService) {}

  @Get('public')
  @ApiOperation({ summary: 'Obtenir la configuration publique' })
  async getPublicConfig() {
    return this.configService.getPublicConfig();
  }

  @Get('category')
  @ApiOperation({ summary: 'Obtenir la config par catégorie' })
  @ApiQuery({ name: 'category', required: true })
  async getByCategory(@Query('category') category: string) {
    return this.configService.getByCategory(category);
  }

  @Put('branding')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour la configuration de marque' })
  async updateBranding(@Body() branding: {
    appName?: string;
    appTagline?: string;
    appLogo?: string;
    favicon?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }) {
    return this.configService.updateBranding(branding);
  }

  // ==================== INFO PAGE ====================

  @Get('info-page')
  @ApiOperation({ summary: 'Obtenir le contenu de la page Informations' })
  async getInfoPageContent() {
    return this.configService.getInfoPageContent();
  }

  @Put('info-page')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le contenu de la page Informations' })
  async updateInfoPageContent(@Body() content: {
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
    return this.configService.updateInfoPageContent(content);
  }
}
