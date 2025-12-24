import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmakersService {
  constructor(private prisma: PrismaService) {}

  async findAll(country?: string) {
    const bookmakers = await this.prisma.bookmaker.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Les bookmakers sont toujours disponibles dans tous les pays
    // Pas de filtre par pays
    return bookmakers;
  }

  async findOne(id: string) {
    return this.prisma.bookmaker.findUnique({
      where: { id },
    });
  }
}
