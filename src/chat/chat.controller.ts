import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Obtenir mes conversations' })
  async getConversations(@CurrentUser() user: any) {
    return this.chatService.getConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Créer ou obtenir une conversation' })
  async getOrCreateConversation(
    @CurrentUser() user: any,
    @Body('agentId') agentId?: string,
    @Body('type') type?: string,
  ) {
    return this.chatService.getOrCreateConversation(user.id, agentId, type);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Obtenir les messages d\'une conversation' })
  async getMessages(@CurrentUser() user: any, @Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId, user.id);
  }
}
