import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RequestWithdrawalDto } from './dto';

@Injectable()
export class ReferralService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async checkCode(code: string) {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code, isActive: true },
    });

    return {
      valid: !!referralCode,
      commissionPercent: referralCode?.commissionPercent,
      withdrawalThreshold: referralCode?.withdrawalThreshold,
    };
  }

  async validateCode(code: string) {
    // Rechercher l'utilisateur qui possède ce code de parrainage
    const owner = await this.prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        referralCode: true,
      },
    });

    if (!owner) {
      return {
        valid: false,
        message: 'Code promo invalide',
      };
    }

    return {
      valid: true,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      message: 'Code promo valide',
    };
  }

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referredBy: true,
        referralBalance: true,
      },
    });

    return user;
  }

  async getWithdrawals(userId: string) {
    return this.prisma.referralWithdrawal.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestWithdrawal(userId: string, dto: RequestWithdrawalDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (user.referralBalance < dto.amount) {
      throw new BadRequestException('Solde insuffisant');
    }

    const referralCode = await this.prisma.referralCode.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const threshold = referralCode?.withdrawalThreshold || 2000;

    if (dto.amount < threshold) {
      throw new BadRequestException(
        `Le montant minimum de retrait est ${threshold} FCFA`,
      );
    }

    const withdrawal = await this.prisma.referralWithdrawal.create({
      data: {
        clientId: userId,
        amount: dto.amount,
        phoneNumber: dto.phoneNumber,
      },
    });

    // Déduire du solde
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        referralBalance: {
          decrement: dto.amount,
        },
      },
    });

    // Notification
    await this.notificationsService.create({
      userId,
      type: 'WITHDRAWAL_PROCESSED',
      title: 'Demande de retrait',
      body: `Votre demande de retrait de ${dto.amount} FCFA a été enregistrée`,
      data: JSON.stringify({ withdrawalId: withdrawal.id }),
    });

    return withdrawal;
  }

  async processWithdrawal(
    withdrawalId: string,
    state: string,
    adminId: string,
  ) {
    const withdrawal = await this.prisma.referralWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: { client: true },
    });

    if (!withdrawal) {
      throw new BadRequestException('Retrait introuvable');
    }

    if (withdrawal.state !== 'PENDING') {
      throw new BadRequestException('Ce retrait a déjà été traité');
    }

    const updated = await this.prisma.referralWithdrawal.update({
      where: { id: withdrawalId },
      data: {
        state,
        processedAt: new Date(),
      },
    });

    // Si rejeté, rembourser
    if (state === 'REJECTED') {
      await this.prisma.user.update({
        where: { id: withdrawal.clientId },
        data: {
          referralBalance: {
            increment: withdrawal.amount,
          },
        },
      });
    }

    // Notification
    await this.notificationsService.create({
      userId: withdrawal.clientId,
      type: 'WITHDRAWAL_PROCESSED',
      title:
        state === 'COMPLETED'
          ? 'Retrait effectué'
          : 'Retrait rejeté',
      body:
        state === 'COMPLETED'
          ? `Votre retrait de ${withdrawal.amount} FCFA a été effectué`
          : `Votre retrait de ${withdrawal.amount} FCFA a été rejeté`,
      data: JSON.stringify({ withdrawalId: withdrawal.id }),
    });

    // Email
    await this.notificationsService.sendEmail({
      to: withdrawal.client.email || withdrawal.client.phone + '@sms.local',
      subject:
        state === 'COMPLETED'
          ? 'Retrait effectué'
          : 'Retrait rejeté',
      html: `
        <h2>Bonjour ${withdrawal.client.firstName},</h2>
        <p>Votre retrait de ${withdrawal.amount} FCFA a été ${state === 'COMPLETED' ? 'effectué avec succès' : 'rejeté'}.</p>
      `,
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'PROCESS_REFERRAL_WITHDRAWAL',
        entity: 'ReferralWithdrawal',
        entityId: withdrawalId,
        metadata: JSON.stringify({ state }),
      },
    });

    return updated;
  }
}
