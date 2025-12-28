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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestWithdrawalDto } from './dto';

@ApiTags('Referral')
@Controller('referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('check-code')
  @ApiOperation({ summary: 'Vérifier un code parrainage' })
  async checkCode(@Query('code') code: string) {
    return this.referralService.checkCode(code);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Valider un code promo avec informations du parrain' })
  async validateCode(@Param('code') code: string) {
    return this.referralService.validateCode(code);
  }

  @Get('balance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir mon solde de parrainage' })
  async getBalance(@CurrentUser() user: any) {
    return this.referralService.getBalance(user.id);
  }

  @Get('withdrawals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir mes retraits de parrainage' })
  async getWithdrawals(@CurrentUser() user: any) {
    return this.referralService.getWithdrawals(user.id);
  }

  @Post('withdrawals')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Demander un retrait de parrainage' })
  async requestWithdrawal(
    @CurrentUser() user: any,
    @Body() dto: RequestWithdrawalDto,
  ) {
    return this.referralService.requestWithdrawal(user.id, dto);
  }

  @Put('withdrawals/:id/process')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPPORT')
  @ApiOperation({ summary: 'Traiter une demande de retrait (Admin)' })
  async processWithdrawal(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('state') state: string,
  ) {
    return this.referralService.processWithdrawal(id, state, user.id);
  }
}
