import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RBACService {
  constructor(private prisma: PrismaService) {}

  // ==================== ROLES ====================

  async createRole(data: { name: string; description?: string; createdById?: string }) {
    const existing = await this.prisma.role.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new BadRequestException('Un rôle avec ce nom existe déjà');
    }

    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        createdById: data.createdById,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    return role;
  }

  async updateRole(id: string, data: { name?: string; description?: string }) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    if (role.isSystem) {
      throw new BadRequestException('Les rôles système ne peuvent pas être modifiés');
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    if (role.isSystem) {
      throw new BadRequestException('Les rôles système ne peuvent pas être supprimés');
    }

    return this.prisma.role.delete({ where: { id } });
  }

  // ==================== PERMISSIONS ====================

  async createPermission(data: { code: string; name: string; description?: string; category: string }) {
    const existing = await this.prisma.permission.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new BadRequestException('Une permission avec ce code existe déjà');
    }

    return this.prisma.permission.create({ data });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async getPermissionsByCategory() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });

    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }

  // ==================== ROLE PERMISSIONS ====================

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    // Supprimer les permissions existantes
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    // Ajouter les nouvelles permissions
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({
        roleId,
        permissionId,
      })),
    });

    return this.getRole(roleId);
  }

  async addPermissionToRole(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Rôle introuvable');
    }

    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) {
      throw new NotFoundException('Permission introuvable');
    }

    const existing = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });

    if (existing) {
      throw new BadRequestException('Cette permission est déjà assignée au rôle');
    }

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
      include: {
        permission: true,
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: { roleId, permissionId },
    });

    if (!rolePermission) {
      throw new NotFoundException('Cette permission n\'est pas assignée au rôle');
    }

    return this.prisma.rolePermission.delete({
      where: { id: rolePermission.id },
    });
  }

  // ==================== USER ROLES ====================

  async assignRolesToUser(userId: string, roleIds: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Seuls les administrateurs peuvent avoir des rôles');
    }

    // Supprimer les rôles existants
    await this.prisma.userRole.deleteMany({ where: { userId } });

    // Ajouter les nouveaux rôles
    await this.prisma.userRole.createMany({
      data: roleIds.map(roleId => ({
        userId,
        roleId,
      })),
    });

    return this.getUserWithRoles(userId);
  }

  async getUserWithRoles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isSuperAdmin: true,
        isActive: true,
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
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Si Super Admin, retourner toutes les permissions
    if (user.isSuperAdmin) {
      return this.getAllPermissions();
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
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
    });

    const permissionsMap = new Map();
    userRoles.forEach(userRole => {
      userRole.role.rolePermissions.forEach(rolePermission => {
        permissionsMap.set(rolePermission.permission.id, rolePermission.permission);
      });
    });

    return Array.from(permissionsMap.values());
  }
}
