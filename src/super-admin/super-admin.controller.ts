import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { IsSuperAdmin } from '../auth/decorators/super-admin.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@IsSuperAdmin()
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  // ==================== GESTION DES ADMINS ====================

  @Post('admins')
  createAdmin(@Body() data: {
    email?: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
  }) {
    return this.superAdminService.createAdmin(data);
  }

  @Get('admins')
  getAllAdmins() {
    return this.superAdminService.getAllAdmins();
  }

  @Get('admins/:id')
  getAdmin(@Param('id') id: string) {
    return this.superAdminService.getAdmin(id);
  }

  @Put('admins/:id/toggle-status')
  toggleAdminStatus(@Param('id') id: string) {
    return this.superAdminService.toggleAdminStatus(id);
  }

  @Delete('admins/:id')
  deleteAdmin(@Param('id') id: string) {
    return this.superAdminService.deleteAdmin(id);
  }

  // ==================== GESTION DES UTILISATEURS ====================

  @Get('users')
  getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('role') role?: string,
    @Query('country') country?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.superAdminService.getAllUsers(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
      {
        role,
        country,
        isActive: isActive ? isActive === 'true' : undefined,
      },
    );
  }

  @Put('users/:id/toggle-status')
  toggleUserStatus(@Param('id') id: string) {
    return this.superAdminService.toggleUserStatus(id);
  }

  @Get('users/:id/activity')
  getUserActivity(@Param('id') id: string) {
    return this.superAdminService.getUserActivity(id);
  }

  // ==================== CONFIGURATION GLOBALE ====================

  @Get('config')
  getGlobalConfig() {
    return this.superAdminService.getGlobalConfig();
  }

  @Put('config/:key')
  updateGlobalConfig(@Param('key') key: string, @Body() data: { value: any }) {
    return this.superAdminService.updateGlobalConfig(key, data.value);
  }

  // ==================== STATISTIQUES ====================

  @Get('statistics')
  getGlobalStatistics() {
    return this.superAdminService.getGlobalStatistics();
  }

  // ==================== GESTION DES ASSIGNATIONS AGENT-BOOKMAKER-PAIEMENT ====================

  @Post('agent-assignments')
  assignAgentToBookmakerPayment(@Body() data: {
    agentId: string;
    bookmakerId: string;
    paymentMethodId: string;
    country: string;
    phoneNumber?: string;
    syntaxe?: string;
    frais?: number;
    address?: string;
  }) {
    return this.superAdminService.assignAgentToBookmakerPayment(data);
  }

  @Get('agent-assignments')
  getAllAgentAssignments() {
    return this.superAdminService.getAllAgentAssignments();
  }

  @Get('agent-assignments/agent/:agentId')
  getAgentAssignments(@Param('agentId') agentId: string) {
    return this.superAdminService.getAgentAssignments(agentId);
  }

  @Put('agent-assignments/:id')
  updateAgentAssignment(
    @Param('id') id: string,
    @Body() data: {
      phoneNumber?: string;
      syntaxe?: string;
      frais?: number;
      address?: string;
      isActive?: boolean;
    },
  ) {
    return this.superAdminService.updateAgentAssignment(id, data);
  }

  @Put('agent-assignments/:id/toggle-status')
  toggleAgentAssignmentStatus(@Param('id') id: string) {
    return this.superAdminService.toggleAgentAssignmentStatus(id);
  }

  @Delete('agent-assignments/:id')
  deleteAgentAssignment(@Param('id') id: string) {
    return this.superAdminService.deleteAgentAssignment(id);
  }

  // ==================== GESTION DES COMMANDES ====================

  @Get('orders')
  getAllOrders(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('state') state?: string,
    @Query('type') type?: string,
  ) {
    return this.superAdminService.getAllOrders(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 50,
      {
        state,
        type,
      },
    );
  }
}
