import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';

@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Get('agents/online')
  @ApiOperation({
    summary: 'Obtenir les agents en ligne pour un moyen de paiement, bookmaker et pays',
  })
  @ApiQuery({ name: 'paymentMethodId', required: true })
  @ApiQuery({ name: 'bookmakerId', required: true })
  @ApiQuery({ name: 'country', required: true })
  async getOnlineAgents(
    @Query('paymentMethodId') paymentMethodId: string,
    @Query('bookmakerId') bookmakerId: string,
    @Query('country') country: string,
  ) {
    return this.paymentMethodsService.getOnlineAgents(
      paymentMethodId,
      bookmakerId,
      country,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les moyens de paiement actifs' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('country') country?: string,
    @Query('type') type?: string,
  ) {
    return this.paymentMethodsService.findAll(country, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un moyen de paiement par ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }
}
