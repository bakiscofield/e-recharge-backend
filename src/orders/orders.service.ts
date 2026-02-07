import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { generateOrderEmail } from '../notifications/email-templates';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Vérifier que l'agent existe et est en ligne
    const employeePaymentMethod = await this.prisma.employeePaymentMethod.findUnique({
      where: { id: dto.employeePaymentMethodId },
      include: {
        employee: true,
        paymentMethod: true,
        bookmaker: true,
      },
    });

    if (!employeePaymentMethod) {
      throw new BadRequestException('Méthode de paiement agent introuvable');
    }

    // Créer la commande
    const order = await this.prisma.order.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        fees: employeePaymentMethod.frais,
        clientId: userId,
        bookmakerId: dto.bookmakerId,
        employeePaymentMethodId: dto.employeePaymentMethodId,
        bookmakerIdentifier: dto.bookmakerIdentifier,
        clientContact: dto.clientContact,
        referenceId: dto.referenceId,
      },
      include: {
        client: true,
        bookmaker: true,
        employeePaymentMethod: {
          include: {
            employee: true,
            paymentMethod: true,
          },
        },
      },
    });

    // Notification client
    await this.notificationsService.create({
      userId,
      type: 'ORDER_STATUS_CHANGED',
      title: dto.type === 'DEPOT' ? 'Dépôt créé' : 'Retrait créé',
      body: `Votre ${dto.type === 'DEPOT' ? 'dépôt' : 'retrait'} de ${dto.amount} FCFA est en cours de traitement`,
      data: JSON.stringify({ orderId: order.id }),
    });

    // Notification caissier/agent
    await this.notificationsService.create({
      userId: employeePaymentMethod.employeeId,
      type: 'NEW_ORDER_ASSIGNED',
      title: `Nouvelle demande de ${dto.type === 'DEPOT' ? 'dépôt' : 'retrait'}`,
      body: `${order.client.firstName} ${order.client.lastName} demande un ${dto.type === 'DEPOT' ? 'dépôt' : 'retrait'} de ${dto.amount} FCFA sur ${employeePaymentMethod.bookmaker.name}`,
      data: JSON.stringify({
        orderId: order.id,
        clientName: `${order.client.firstName} ${order.client.lastName}`,
        amount: dto.amount,
        type: dto.type,
        bookmaker: employeePaymentMethod.bookmaker.name,
        paymentMethod: employeePaymentMethod.paymentMethod.name,
        clientContact: dto.clientContact,
        referenceId: dto.referenceId,
      }),
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_ORDER',
        entity: 'Order',
        entityId: order.id,
        metadata: JSON.stringify({ type: dto.type, amount: dto.amount }),
      },
    });

    return order;
  }

  async findAll(userId: string, type?: string) {
    const where: any = { clientId: userId };
    if (type) {
      where.type = type;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        bookmaker: true,
        employeePaymentMethod: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, clientId: userId },
      include: {
        client: true,
        bookmaker: true,
        employeePaymentMethod: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            paymentMethod: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        employeePaymentMethod: {
          include: {
            bookmaker: true,
            paymentMethod: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    // Vérifier que l'agent a accès à cette paire (bookmaker, moyen de paiement)
    // Le Super Admin doit également avoir une assignation pour valider
    const agentAccess = await this.prisma.employeePaymentMethod.findFirst({
      where: {
        employeeId: adminId,
        bookmakerId: order.employeePaymentMethod.bookmakerId,
        paymentMethodId: order.employeePaymentMethod.paymentMethodId,
        isActive: true,
      },
    });

    if (!agentAccess) {
      throw new BadRequestException(
        'Vous n\'avez pas accès à ce bookmaker et moyen de paiement pour traiter cette commande'
      );
    }

    const updateData: any = { state: dto.state };

    if (dto.state === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (dto.state === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = dto.cancellationReason;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        bookmaker: true,
        employeePaymentMethod: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    // Si dépôt confirmé, verser la commission au parrain
    if (dto.state === 'CONFIRMED' && order.type === 'DEPOT') {
      const client = await this.prisma.user.findUnique({
        where: { id: order.clientId },
      });

      if (client?.referredBy) {
        // Chercher le parrain avec ce code
        const referrer = await this.prisma.user.findUnique({
          where: { referralCode: client.referredBy },
        });

        if (referrer) {
          // Chercher la configuration de parrainage globale (code 'DEFAULT')
          const referralConfig = await this.prisma.referralCode.findUnique({
            where: { code: 'DEFAULT' },
          });

          // Utiliser le pourcentage configuré ou 5% par défaut
          const commissionPercent = referralConfig?.commissionPercent ?? 5;
          const commission = (order.amount * commissionPercent) / 100;

          // Ajouter la commission au solde du parrain
          await this.prisma.user.update({
            where: { id: referrer.id },
            data: {
              referralBalance: {
                increment: commission,
              },
            },
          });

          // Notifier le parrain
          await this.notificationsService.create({
            userId: referrer.id,
            type: 'REFERRAL_COMMISSION',
            title: 'Commission de parrainage',
            body: `Vous avez reçu ${commission.toLocaleString('fr-FR')} FCFA de commission sur le dépôt de ${client.firstName} (${order.amount.toLocaleString('fr-FR')} FCFA)`,
            data: JSON.stringify({
              orderId: order.id,
              commission,
              filleulName: `${client.firstName} ${client.lastName}`,
              depositAmount: order.amount,
            }),
          });
        }
      }
    }

    // Notification client
    await this.notificationsService.create({
      userId: order.clientId,
      type: 'ORDER_STATUS_CHANGED',
      title: `Commande ${dto.state === 'CONFIRMED' ? 'confirmée' : 'annulée'}`,
      body:
        dto.state === 'CONFIRMED'
          ? `Votre ${order.type === 'DEPOT' ? 'dépôt' : 'retrait'} de ${order.amount} FCFA a été confirmé`
          : `Votre ${order.type === 'DEPOT' ? 'dépôt' : 'retrait'} a été annulé${dto.cancellationReason ? `: ${dto.cancellationReason}` : ''}`,
      data: JSON.stringify({ orderId: order.id }),
    });

    // Email notification avec template professionnel
    const transactionType = order.type === 'DEPOT' ? 'Dépôt' : 'Retrait';
    const emailSubject = dto.state === 'CONFIRMED'
      ? `${transactionType} Confirmé - ${order.amount.toLocaleString('fr-FR')} FCFA`
      : `${transactionType} Non Confirmé`;

    const emailHtml = generateOrderEmail(dto.state as 'CONFIRMED' | 'CANCELLED', {
      clientName: order.client.firstName,
      orderType: order.type as 'DEPOT' | 'RETRAIT',
      amount: order.amount,
      fees: order.fees,
      bookmakerName: order.employeePaymentMethod.bookmaker.name,
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      cancellationReason: dto.cancellationReason,
      appName: process.env.APP_NAME || 'Notre Plateforme',
    });

    await this.notificationsService.sendEmail({
      to: order.client.email || order.client.phone + '@sms.local',
      subject: emailSubject,
      html: emailHtml,
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_ORDER_STATUS',
        entity: 'Order',
        entityId: order.id,
        metadata: JSON.stringify({ oldState: order.state, newState: dto.state }),
      },
    });

    return updatedOrder;
  }

  async getStats(userId: string) {
    const [total, confirmed, cancelled, pending] = await Promise.all([
      this.prisma.order.count({ where: { clientId: userId } }),
      this.prisma.order.count({
        where: { clientId: userId, state: 'CONFIRMED' },
      }),
      this.prisma.order.count({
        where: { clientId: userId, state: 'CANCELLED' },
      }),
      this.prisma.order.count({
        where: { clientId: userId, state: 'COMING' },
      }),
    ]);

    const totalAmount = await this.prisma.order.aggregate({
      where: { clientId: userId, state: 'CONFIRMED' },
      _sum: { amount: true },
    });

    return {
      total,
      confirmed,
      cancelled,
      pending,
      totalAmount: totalAmount._sum.amount || 0,
    };
  }
}
