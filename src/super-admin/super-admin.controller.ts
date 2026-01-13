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

  @Put('admins/:id')
  updateAdmin(@Param('id') id: string, @Body() data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }) {
    return this.superAdminService.updateAdmin(id, data);
  }

  @Put('admins/:id/status')
  updateAdminStatus(@Param('id') id: string, @Body() data: { isActive: boolean }) {
    return this.superAdminService.updateAdminStatus(id, data.isActive);
  }

  // ==================== GESTION DES AGENTS ====================

  @Post('agents')
  createAgent(@Body() data: {
    email?: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
  }) {
    return this.superAdminService.createAgent(data);
  }

  @Get('agents')
  getAllAgents() {
    return this.superAdminService.getAllAgents();
  }

  @Get('agents/:id')
  getAgent(@Param('id') id: string) {
    return this.superAdminService.getAgent(id);
  }

  @Put('agents/:id')
  updateAgent(@Param('id') id: string, @Body() data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }) {
    return this.superAdminService.updateAgent(id, data);
  }

  @Put('agents/:id/status')
  updateAgentStatus(@Param('id') id: string, @Body() data: { isActive: boolean }) {
    return this.superAdminService.updateAgentStatus(id, data.isActive);
  }

  @Delete('agents/:id')
  deleteAgent(@Param('id') id: string) {
    return this.superAdminService.deleteAgent(id);
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

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    country?: string;
    role?: string;
  }) {
    return this.superAdminService.updateUser(id, data);
  }

  @Put('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() data: { isActive: boolean }) {
    return this.superAdminService.updateUserStatus(id, data.isActive);
  }

  @Put('users/:id/toggle-status')
  toggleUserStatus(@Param('id') id: string) {
    return this.superAdminService.toggleUserStatus(id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.superAdminService.deleteUser(id);
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

  // ==================== CONFIGURATION PARRAINAGE ====================

  @Get('referral-config')
  getReferralConfig() {
    return this.superAdminService.getReferralConfig();
  }

  @Put('referral-config')
  updateReferralConfig(@Body() data: {
    commissionPercent: number;
    commissionType: string;
    withdrawalThreshold: number;
  }) {
    return this.superAdminService.updateReferralConfig(data);
  }

  // ==================== GESTION DES BOOKMAKERS ====================

  @Get('bookmakers')
  getAllBookmakers() {
    return this.superAdminService.getAllBookmakers();
  }

  @Post('bookmakers')
  createBookmaker(@Body() data: {
    name: string;
    countries: string[];
    logo?: string;
    order?: number;
  }) {
    return this.superAdminService.createBookmaker(data);
  }

  @Put('bookmakers/:id')
  updateBookmaker(
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      countries?: string[];
      logo?: string;
      order?: number;
      isActive?: boolean;
    },
  ) {
    return this.superAdminService.updateBookmaker(id, data);
  }

  @Put('bookmakers/:id/toggle-status')
  toggleBookmakerStatus(@Param('id') id: string) {
    return this.superAdminService.toggleBookmakerStatus(id);
  }

  @Delete('bookmakers/:id')
  deleteBookmaker(@Param('id') id: string) {
    return this.superAdminService.deleteBookmaker(id);
  }
}
