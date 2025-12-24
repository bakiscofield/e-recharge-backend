import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques tableau de bord' })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.adminService.getDashboardStats(user.id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Obtenir les commandes assignées à l\'admin connecté' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'state', required: false })
  async getAllOrders(
    @CurrentUser() user: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('state') state?: string,
  ) {
    return this.adminService.getMyOrders(
      user.id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
      state,
    );
  }

  @Get('users')
  @ApiOperation({ summary: 'Obtenir tous les utilisateurs' })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  async getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.adminService.getAllUsers(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
    );
  }

  @Put('config/:key')
  @ApiOperation({ summary: 'Mettre à jour une config' })
  async updateConfig(@Param('key') key: string, @Body('value') value: any) {
    return this.adminService.updateConfig(key, value);
  }

  @Post('bookmakers')
  @ApiOperation({ summary: 'Créer un bookmaker' })
  async createBookmaker(@Body() data: any) {
    return this.adminService.createBookmaker(data);
  }

  @Put('bookmakers/:id')
  @ApiOperation({ summary: 'Modifier un bookmaker' })
  async updateBookmaker(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBookmaker(id, data);
  }

  @Delete('bookmakers/:id')
  @ApiOperation({ summary: 'Supprimer un bookmaker' })
  async deleteBookmaker(@Param('id') id: string) {
    return this.adminService.deleteBookmaker(id);
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Créer un moyen de paiement' })
  async createPaymentMethod(@Body() data: any) {
    return this.adminService.createPaymentMethod(data);
  }

  @Put('payment-methods/:id')
  @ApiOperation({ summary: 'Modifier un moyen de paiement' })
  async updatePaymentMethod(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updatePaymentMethod(id, data);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Supprimer un moyen de paiement' })
  async deletePaymentMethod(@Param('id') id: string) {
    return this.adminService.deletePaymentMethod(id);
  }
}
