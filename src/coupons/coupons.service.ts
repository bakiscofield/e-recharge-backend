import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // Créer un coupon (admin)
  async create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        title: dto.title,
        description: dto.description,
        content: dto.content,
        type: dto.type,
        imageUrl: dto.imageUrl,
        documentUrl: dto.documentUrl,
        documentUrls: dto.documentUrls || [],
        date: dto.date ? new Date(dto.date) : new Date(),
        isActive: dto.isActive ?? true,
      },
    });
  }

  // Récupérer tous les coupons actifs (client)
  async findAllActive() {
    return this.prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
    });
  }

  // Récupérer tous les coupons (admin)
  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  // Récupérer un coupon par ID
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon introuvable');
    }

    return coupon;
  }

  // Mettre à jour un coupon (admin)
  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id); // Vérifie que le coupon existe

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.type && { type: dto.type }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.documentUrl !== undefined && { documentUrl: dto.documentUrl }),
        ...(dto.documentUrls !== undefined && { documentUrls: dto.documentUrls }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  // Supprimer un coupon (admin)
  async remove(id: string) {
    await this.findOne(id); // Vérifie que le coupon existe

    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  // Activer/Désactiver un coupon
  async toggleActive(id: string) {
    const coupon = await this.findOne(id);

    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }
}
