import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une commande (dépôt/retrait)' })
  async create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir mes commandes' })
  @ApiQuery({ name: 'type', enum: ['DEPOT', 'RETRAIT'], required: false })
  async findAll(@CurrentUser() user: any, @Query('type') type?: string) {
    return this.ordersService.findAll(user.id, type);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de mes commandes' })
  async getStats(@CurrentUser() user: any) {
    return this.ordersService.getStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une commande par ID' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une commande (avec permissions)' })
  @UseGuards(PermissionsGuard)
  @Permissions('orders.validate', 'orders.reject')
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto, user.id);
  }
}
