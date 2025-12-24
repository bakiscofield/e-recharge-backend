import { Module } from '@nestjs/common';
import { BookmakersController } from './bookmakers.controller';
import { BookmakersService } from './bookmakers.service';

@Module({
  controllers: [BookmakersController],
  providers: [BookmakersService],
  exports: [BookmakersService],
})
export class BookmakersModule {}
