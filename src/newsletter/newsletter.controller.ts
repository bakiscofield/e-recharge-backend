import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NewsletterService, NewsletterData } from './newsletter.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('newsletters')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  // Routes publiques
  @Get('published')
  getPublishedNewsletters(@Query('country') country?: string, @Query('role') role?: string) {
    return this.newsletterService.getPublishedNewsletters(country, role);
  }

  @Get(':id/public')
  getPublishedNewsletter(@Param('id') id: string) {
    return this.newsletterService.getNewsletter(id);
  }

  // Routes admin
  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.create')
  createNewsletter(@Body() data: NewsletterData) {
    return this.newsletterService.createNewsletter(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.view')
  getAllNewsletters(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.newsletterService.getAllNewsletters(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.view')
  getNewsletter(@Param('id') id: string) {
    return this.newsletterService.getNewsletter(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.edit')
  updateNewsletter(@Param('id') id: string, @Body() data: Partial<NewsletterData>) {
    return this.newsletterService.updateNewsletter(id, data);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.publish')
  publishNewsletter(@Param('id') id: string) {
    return this.newsletterService.publishNewsletter(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.publish')
  unpublishNewsletter(@Param('id') id: string) {
    return this.newsletterService.unpublishNewsletter(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.delete')
  deleteNewsletter(@Param('id') id: string) {
    return this.newsletterService.deleteNewsletter(id);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('newsletters.send')
  sendNewsletter(@Param('id') id: string) {
    return this.newsletterService.sendNewsletter(id);
  }
}
