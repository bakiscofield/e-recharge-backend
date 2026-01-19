import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private configService: AppConfigService,
  ) {}

  async getDashboardStats(adminId: string) {
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      totalDeposits,
      totalWithdrawals,
      totalAgents,
      onlineAgents,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.order.count({
        where: {
          employeePaymentMethod: {
            employeeId: adminId,
          },
        },
      }),
      this.prisma.order.count({
        where: {
          state: 'COMING',
          employeePaymentMethod: {
            employeeId: adminId,
          },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          state: 'CONFIRMED',
          type: 'DEPOT',
          employeePaymentMethod: {
            employeeId: adminId,
          },
        },
        _sum: { amount: true, fees: true },
      }),
      this.prisma.order.aggregate({
        where: {
          state: 'CONFIRMED',
          type: 'RETRAIT',
          employeePaymentMethod: {
            employeeId: adminId,
          },
        },
        _sum: { amount: true, fees: true },
      }),
      this.prisma.user.count({ where: { role: 'AGENT' } }),
      this.prisma.user.count({ where: { role: 'AGENT', isOnline: true } }),
    ]);

    return {
      totalUsers,
      totalOrders,
      pendingOrders,
      totalDeposits: totalDeposits._sum.amount || 0,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      depositFees: totalDeposits._sum.fees || 0,
      withdrawalFees: totalWithdrawals._sum.fees || 0,
      totalAgents,
      onlineAgents,
    };
  }

  async getAllOrders(skip = 0, take = 50) {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          bookmaker: true,
          employeePaymentMethod: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              paymentMethod: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return { orders, total, page: Math.floor(skip / take) + 1, pages: Math.ceil(total / take) };
  }

  async getMyOrders(adminId: string, skip = 0, take = 50, state?: string) {
    // Récupérer les commandes assignées à cet admin via employeePaymentMethod
    const where: any = {
      employeePaymentMethod: {
        employeeId: adminId,
      },
    };

    if (state) {
      where.state = state;
    }

    return this.prisma.order.findMany({
      where,
      skip,
      take,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        bookmaker: true,
        employeePaymentMethod: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllUsers(skip = 0, take = 50) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          country: true,
          role: true,
          isOnline: true,
          isVerified: true,
          referralCode: true,
          referralBalance: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total, page: Math.floor(skip / take) + 1, pages: Math.ceil(total / take) };
  }

  async updateConfig(key: string, value: any) {
    return this.configService.set(key, value);
  }

  async createBookmaker(data: any) {
    return this.prisma.bookmaker.create({
      data: {
        name: data.name,
        logo: data.logo,
        countries: JSON.stringify(data.countries),
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
      },
    });
  }

  async updateBookmaker(id: string, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.logo) updateData.logo = data.logo;
    if (data.countries) updateData.countries = JSON.stringify(data.countries);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.order !== undefined) updateData.order = data.order;

    return this.prisma.bookmaker.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteBookmaker(id: string) {
    return this.prisma.bookmaker.delete({
      where: { id },
    });
  }

  async createPaymentMethod(data: any) {
    return this.prisma.paymentMethod.create({
      data: {
        type: data.type,
        name: data.name,
        logo: data.logo,
        countries: JSON.stringify(data.countries),
        isActive: data.isActive ?? true,
        order: data.order ?? 0,
        ussdTemplate: data.ussdTemplate,
        instructions: data.instructions,
      },
    });
  }

  async updatePaymentMethod(id: string, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.logo) updateData.logo = data.logo;
    if (data.countries) updateData.countries = JSON.stringify(data.countries);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.ussdTemplate) updateData.ussdTemplate = data.ussdTemplate;
    if (data.instructions) updateData.instructions = data.instructions;

    return this.prisma.paymentMethod.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePaymentMethod(id: string) {
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}
