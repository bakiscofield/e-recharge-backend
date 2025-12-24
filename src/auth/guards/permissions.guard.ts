import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Vérifier si l'endpoint est réservé au Super Admin
    const isSuperAdminOnly = this.reflector.getAllAndOverride<boolean>(IS_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Si l'endpoint est réservé au Super Admin
    if (isSuperAdminOnly) {
      if (!user.isSuperAdmin) {
        throw new ForbiddenException('Accès réservé au Super Admin');
      }
      return true;
    }

    // Si Super Admin, accès total
    if (user.isSuperAdmin) {
      return true;
    }

    // Récupérer les permissions requises
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si pas de permissions requises, autoriser
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Vérifier si l'utilisateur est Admin ou Agent
    if (user.role !== 'ADMIN' && user.role !== 'AGENT') {
      throw new ForbiddenException('Accès réservé aux administrateurs et agents');
    }

    // Les AGENT n'ont pas besoin de permissions spécifiques (ils gèrent juste leurs propres commandes)
    if (user.role === 'AGENT') {
      return true;
    }

    // Récupérer les permissions de l'utilisateur (pour les ADMIN)
    const userPermissions = await this.getUserPermissions(user.id);

    // Vérifier si l'utilisateur a toutes les permissions requises
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    return true;
  }

  private async getUserPermissions(userId: string): Promise<string[]> {
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

    const permissions = new Set<string>();

    userRoles.forEach(userRole => {
      userRole.role.rolePermissions.forEach(rolePermission => {
        permissions.add(rolePermission.permission.code);
      });
    });

    return Array.from(permissions);
  }
}
