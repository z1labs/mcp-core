import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { UserSession } from 'common/decorators/user-session.decorator';
import { JwtGuard } from 'modules/auth/guards/jwt.guard';
import { User } from 'modules/database/entities/user.entity';

import { ChatService } from './chat.service';
import {
  ChatHistoryRequestDto,
  ChatHistoryResponseDto,
  SendMessageRequestDto,
  SendMessageResponseDto,
} from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('send-message')
  @ApiResponse({
    status: 200,
    description: 'Successfully sent a message',
    type: SendMessageResponseDto,
  })
  public async sendMessage(
    @Body() body: SendMessageRequestDto,
    @UserSession() user: User,
  ): Promise<SendMessageResponseDto> {
    const content = await this.chatService.sendMessage(user.id, body.content);
    return {
      content,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('history')
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched chat history',
    type: ChatHistoryResponseDto,
  })
  public async getHistory(
    @Query() query: ChatHistoryRequestDto,
    @UserSession() user: User,
  ): Promise<ChatHistoryResponseDto> {
    const messages = await this.chatService.getHistory(user.id, query.limit, query.offset);
    return messages;
  }
}
