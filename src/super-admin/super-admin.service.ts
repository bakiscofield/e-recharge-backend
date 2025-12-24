import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  // ==================== GESTION DES ADMINS ====================

  async createAdmin(data: {
    email?: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
  }) {
    // Vérifier si l'utilisateur existe déjà
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { email: data.email },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Un utilisateur avec ce téléphone ou email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Créer l'admin
    return this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        country: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getAllAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isSuperAdmin: false,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        country: true,
        role: true,
        isActive: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        country: true,
        role: true,
        isActive: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        auditLogs: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin introuvable');
    }

    return admin;
  }

  async toggleAdminStatus(id: string) {
    const admin = await this.prisma.user.findUnique({ where: { id } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin introuvable');
    }

    if (admin.isSuperAdmin) {
      throw new BadRequestException('Impossible de désactiver le Super Admin');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !admin.isActive },
    });
  }

  async deleteAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({ where: { id } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin introuvable');
    }

    if (admin.isSuperAdmin) {
      throw new BadRequestException('Impossible de supprimer le Super Admin');
    }

    return this.prisma.user.delete({ where: { id } });
  }

  // ==================== GESTION DES UTILISATEURS ====================

  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async getAllUsers(skip = 0, take = 50, filters?: {
    role?: string;
    country?: string;
    isActive?: boolean;
  }) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.country) where.country = filters.country;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
          isActive: true,
          isOnline: true,
          isVerified: true,
          referralCode: true,
          referralBalance: true,
          createdAt: true,
          lastSeen: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  async getUserActivity(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const [orders, auditLogs] = await Promise.all([
      this.prisma.order.findMany({
        where: { clientId: userId },
        include: {
          bookmaker: true,
          employeePaymentMethod: {
            include: {
              paymentMethod: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        isActive: user.isActive,
      },
      orders,
      auditLogs,
    };
  }

  // ==================== CONFIGURATION GLOBALE ====================

  async getGlobalConfig() {
    return this.prisma.appConfig.findMany({
      orderBy: { category: 'asc' },
    });
  }

  async updateGlobalConfig(key: string, value: any) {
    const existing = await this.prisma.appConfig.findUnique({ where: { key } });

    if (existing) {
      return this.prisma.appConfig.update({
        where: { key },
        data: { value: JSON.stringify(value) },
      });
    } else {
      return this.prisma.appConfig.create({
        data: {
          key,
          value: JSON.stringify(value),
          category: 'general',
        },
      });
    }
  }

  // ==================== STATISTIQUES GLOBALES ====================

  async getGlobalStatistics() {
    const [
      totalUsers,
      totalAdmins,
      totalClients,
      totalAgents,
      activeUsers,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      totalRevenue,
      bookmakers,
      paymentMethods,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.user.count({ where: { role: 'AGENT' } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { state: 'COMING' } }),
      this.prisma.order.count({ where: { state: 'CONFIRMED' } }),
      this.prisma.order.aggregate({
        where: { state: 'CONFIRMED' },
        _sum: { amount: true, fees: true },
      }),
      this.prisma.bookmaker.count(),
      this.prisma.paymentMethod.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        clients: totalClients,
        agents: totalAgents,
        active: activeUsers,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        revenue: totalRevenue._sum.amount || 0,
        fees: totalRevenue._sum.fees || 0,
      },
      system: {
        bookmakers,
        paymentMethods,
      },
    };
  }

  // ==================== GESTION DES ASSIGNATIONS AGENT-BOOKMAKER-PAIEMENT ====================

  async assignAgentToBookmakerPayment(data: {
    agentId: string;
    bookmakerId: string;
    paymentMethodId: string;
    country: string;
    phoneNumber?: string;
    syntaxe?: string;
    frais?: number;
    address?: string;
  }) {
    // Vérifier que l'agent existe et a le rôle ADMIN ou AGENT
    const agent = await this.prisma.user.findUnique({
      where: { id: data.agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent introuvable');
    }

    if (agent.role !== 'ADMIN' && agent.role !== 'AGENT') {
      throw new BadRequestException('Cet utilisateur n\'est pas un agent ou admin');
    }

    // Vérifier que le bookmaker existe
    const bookmaker = await this.prisma.bookmaker.findUnique({
      where: { id: data.bookmakerId },
    });

    if (!bookmaker) {
      throw new NotFoundException('Bookmaker introuvable');
    }

    // Vérifier que le moyen de paiement existe
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: data.paymentMethodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Moyen de paiement introuvable');
    }

    // Créer l'assignation
    return this.prisma.employeePaymentMethod.create({
      data: {
        employeeId: data.agentId,
        bookmakerId: data.bookmakerId,
        paymentMethodId: data.paymentMethodId,
        country: data.country,
        phoneNumber: data.phoneNumber,
        syntaxe: data.syntaxe,
        frais: data.frais || 0,
        address: data.address,
        isActive: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
        bookmaker: true,
        paymentMethod: true,
      },
    });
  }

  async getAgentAssignments(agentId: string) {
    return this.prisma.employeePaymentMethod.findMany({
      where: { employeeId: agentId },
      include: {
        bookmaker: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAgentAssignments() {
    return this.prisma.employeePaymentMethod.findMany({
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isOnline: true,
          },
        },
        bookmaker: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAgentAssignment(
    assignmentId: string,
    data: {
      phoneNumber?: string;
      syntaxe?: string;
      frais?: number;
      address?: string;
      isActive?: boolean;
    },
  ) {
    const assignment = await this.prisma.employeePaymentMethod.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignation introuvable');
    }

    return this.prisma.employeePaymentMethod.update({
      where: { id: assignmentId },
      data,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
        bookmaker: true,
        paymentMethod: true,
      },
    });
  }

  async toggleAgentAssignmentStatus(assignmentId: string) {
    const assignment = await this.prisma.employeePaymentMethod.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignation introuvable');
    }

    return this.prisma.employeePaymentMethod.update({
      where: { id: assignmentId },
      data: { isActive: !assignment.isActive },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
        bookmaker: true,
        paymentMethod: true,
      },
    });
  }

  async deleteAgentAssignment(assignmentId: string) {
    const assignment = await this.prisma.employeePaymentMethod.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignation introuvable');
    }

    return this.prisma.employeePaymentMethod.delete({
      where: { id: assignmentId },
    });
  }

  // ==================== GESTION DES COMMANDES ====================

  async getAllOrders(skip = 0, take = 50, filters?: {
    state?: string;
    type?: string;
  }) {
    const where: any = {};
    if (filters?.state) where.state = filters.state;
    if (filters?.type) where.type = filters.type;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
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
              email: true,
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
                  phone: true,
                },
              },
              paymentMethod: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }
}
