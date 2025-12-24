import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        country: true,
        avatar: true,
        role: true,
        isVerified: true,
        isOnline: true,
        referralCode: true,
        referredBy: true,
        referralBalance: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        country: true,
        avatar: true,
        role: true,
        referralCode: true,
        referralBalance: true,
      },
    });
  }

  async updateOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });
  }

  async getBookmakerIdentifiers(userId: string) {
    return this.prisma.bookmakerIdentifier.findMany({
      where: { clientId: userId },
      include: {
        bookmaker: true,
      },
    });
  }

  async createBookmakerIdentifier(
    userId: string,
    bookmakerId: string,
    identifier: string,
    label?: string,
  ) {
    return this.prisma.bookmakerIdentifier.create({
      data: {
        clientId: userId,
        bookmakerId,
        identifier,
        label,
      },
      include: {
        bookmaker: true,
      },
    });
  }

  async updateBookmakerIdentifier(
    id: string,
    userId: string,
    identifier: string,
    label?: string,
  ) {
    return this.prisma.bookmakerIdentifier.updateMany({
      where: {
        id,
        clientId: userId,
      },
      data: {
        identifier,
        label,
      },
    });
  }

  async deleteBookmakerIdentifier(id: string, userId: string) {
    return this.prisma.bookmakerIdentifier.deleteMany({
      where: {
        id,
        clientId: userId,
      },
    });
  }
}
