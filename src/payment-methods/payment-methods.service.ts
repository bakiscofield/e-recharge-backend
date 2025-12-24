import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll(country?: string, type?: string) {
    const where: any = { isActive: true };

    const methods = await this.prisma.paymentMethod.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    let filtered = methods;

    if (country) {
      filtered = filtered.filter((m) => {
        // BANK et CRYPTO sont toujours disponibles dans tous les pays
        if (m.type === 'BANK' || m.type === 'CRYPTO') {
          return true;
        }
        // MOBILE_MONEY et autres types sont filtrés par pays
        const countries = JSON.parse(m.countries || '[]');
        return countries.includes(country);
      });
    }

    if (type) {
      filtered = filtered.filter((m) => m.type === type);
    }

    return filtered;
  }

  async findOne(id: string) {
    return this.prisma.paymentMethod.findUnique({
      where: { id },
    });
  }

  // Récupérer les agents/caissiers actifs pour un moyen de paiement, bookmaker et pays donnés
  async getOnlineAgents(
    paymentMethodId: string,
    bookmakerId: string,
    country: string,
  ) {
    const employeePaymentMethods = await this.prisma.employeePaymentMethod.findMany({
      where: {
        paymentMethodId,
        bookmakerId,
        country,
        isActive: true,
        employee: {
          isActive: true,
          role: 'AGENT',
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        bookmaker: true,
        paymentMethod: true,
      },
    });

    return employeePaymentMethods;
  }

  // Récupérer les méthodes de paiement d'un agent pour un bookmaker spécifique
  async getAgentMethods(employeeId: string, bookmakerId: string) {
    return this.prisma.employeePaymentMethod.findMany({
      where: {
        employeeId,
        bookmakerId,
        isActive: true,
      },
      include: {
        paymentMethod: true,
        bookmaker: true,
      },
    });
  }
}
