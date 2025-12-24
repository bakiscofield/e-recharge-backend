import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ThemeService, ThemeConfigData } from './theme.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('theme')
export class ThemeController {
  constructor(private themeService: ThemeService) {}

  // Routes publiques (pour les clients)
  @Get('active')
  getActiveTheme() {
    return this.themeService.getActiveTheme();
  }

  @Get('ui-components')
  getVisibleUIComponents(@Query('country') country?: string, @Query('role') role?: string) {
    return this.themeService.getVisibleUIComponents(country, role);
  }

  @Get('ui-components/:componentType')
  getUIComponent(@Param('componentType') componentType: string) {
    return this.themeService.getUIComponent(componentType);
  }

  // Routes admin
  @Get('all')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.theme.view')
  getAllThemes() {
    return this.themeService.getAllThemes();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.theme.edit')
  createTheme(@Body() data: ThemeConfigData) {
    return this.themeService.createTheme(data);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.theme.edit')
  updateTheme(@Body() data: ThemeConfigData) {
    return this.themeService.updateTheme(data);
  }

  @Put('activate/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.theme.edit')
  activateTheme(@Param('id') id: string) {
    return this.themeService.activateTheme(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.theme.edit')
  deleteTheme(@Param('id') id: string) {
    return this.themeService.deleteTheme(id);
  }

  // UI Components
  @Get('ui-components/all/list')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.ui.view')
  getAllUIComponents() {
    return this.themeService.getAllUIComponents();
  }

  @Put('ui-components/:componentType')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.ui.edit')
  updateUIComponent(@Param('componentType') componentType: string, @Body() data: any) {
    return this.themeService.updateUIComponent(componentType, data);
  }

  @Delete('ui-components/:componentType')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config.ui.edit')
  deleteUIComponent(@Param('componentType') componentType: string) {
    return this.themeService.deleteUIComponent(componentType);
  }
}
