import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookmakersService } from './bookmakers.service';

@ApiTags('Bookmakers')
@Controller('bookmakers')
export class BookmakersController {
  constructor(private bookmakersService: BookmakersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les bookmakers actifs' })
  @ApiQuery({ name: 'country', required: false })
  async findAll(@Query('country') country?: string) {
    return this.bookmakersService.findAll(country);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un bookmaker par ID' })
  async findOne(@Param('id') id: string) {
    return this.bookmakersService.findOne(id);
  }
}
