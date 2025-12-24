import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { IsSuperAdmin } from '../auth/decorators/super-admin.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RBACController {
  constructor(private rbacService: RBACService) {}

  // ==================== ROLES ====================

  @Post('roles')
  @IsSuperAdmin()
  createRole(@Body() data: { name: string; description?: string; createdById?: string }) {
    return this.rbacService.createRole(data);
  }

  @Get('roles')
  @Permissions('roles.view')
  getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('roles/:id')
  @Permissions('roles.view')
  getRole(@Param('id') id: string) {
    return this.rbacService.getRole(id);
  }

  @Put('roles/:id')
  @IsSuperAdmin()
  updateRole(@Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return this.rbacService.updateRole(id, data);
  }

  @Delete('roles/:id')
  @IsSuperAdmin()
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  // ==================== PERMISSIONS ====================

  @Post('permissions')
  @IsSuperAdmin()
  createPermission(@Body() data: { code: string; name: string; description?: string; category: string }) {
    return this.rbacService.createPermission(data);
  }

  @Get('permissions')
  @Permissions('permissions.view')
  getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('permissions/by-category')
  @Permissions('permissions.view')
  getPermissionsByCategory() {
    return this.rbacService.getPermissionsByCategory();
  }

  // ==================== ROLE PERMISSIONS ====================

  @Post('roles/:roleId/permissions')
  @IsSuperAdmin()
  assignPermissionsToRole(@Param('roleId') roleId: string, @Body() data: { permissionIds: string[] }) {
    return this.rbacService.assignPermissionsToRole(roleId, data.permissionIds);
  }

  @Post('roles/:roleId/permissions/:permissionId')
  @IsSuperAdmin()
  addPermissionToRole(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rbacService.addPermissionToRole(roleId, permissionId);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @IsSuperAdmin()
  removePermissionFromRole(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }

  // ==================== USER ROLES ====================

  @Post('users/:userId/roles')
  @IsSuperAdmin()
  assignRolesToUser(@Param('userId') userId: string, @Body() data: { roleIds: string[] }) {
    return this.rbacService.assignRolesToUser(userId, data.roleIds);
  }

  @Get('users/:userId/roles')
  @Permissions('users.view')
  getUserWithRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserWithRoles(userId);
  }

  @Get('users/:userId/permissions')
  @Permissions('users.view')
  getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}
