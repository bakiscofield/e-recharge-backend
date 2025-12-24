import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto, CreateBookmakerIdDto, UpdateBookmakerIdDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/bookmaker-ids')
  @ApiOperation({ summary: 'Obtenir mes identifiants bookmaker' })
  async getBookmakerIds(@CurrentUser() user: any) {
    return this.usersService.getBookmakerIdentifiers(user.id);
  }

  @Post('me/bookmaker-ids')
  @ApiOperation({ summary: 'Ajouter un identifiant bookmaker' })
  async createBookmakerId(@CurrentUser() user: any, @Body() dto: CreateBookmakerIdDto) {
    return this.usersService.createBookmakerIdentifier(
      user.id,
      dto.bookmakerId,
      dto.identifier,
      dto.label,
    );
  }

  @Put('me/bookmaker-ids/:id')
  @ApiOperation({ summary: 'Modifier un identifiant bookmaker' })
  async updateBookmakerId(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookmakerIdDto,
  ) {
    return this.usersService.updateBookmakerIdentifier(
      id,
      user.id,
      dto.identifier,
      dto.label,
    );
  }

  @Delete('me/bookmaker-ids/:id')
  @ApiOperation({ summary: 'Supprimer un identifiant bookmaker' })
  async deleteBookmakerId(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.deleteBookmakerIdentifier(id, user.id);
  }
}
