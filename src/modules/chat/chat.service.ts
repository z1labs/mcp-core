import { Injectable, Logger } from '@nestjs/common';

import { AgentService } from 'modules/agent/agent.service';
import { ChatHistoryRepository } from 'modules/database/repository/chat-history.repository';
import { UserService } from 'modules/user/user.service';

import { ChatHistoryResponseDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly userService: UserService,
    private readonly agentService: AgentService,
    private readonly chatHistoryRepository: ChatHistoryRepository,
  ) {}

  public async sendMessage(userId: string, content: string): Promise<string> {
    this.logger.debug(` -> GPT answer: ${content}`);
    this.logger.debug(` -> GPT user ID: ${userId}`);
    const answer = await this.agentService.run(userId, content, {
      userId,
      content
    });
    this.logger.debug(` -> GPT answer: ${answer}`);

    return answer;
  }

  public async getHistory(userId: string, limit: number = 20, offset: number = 0): Promise<ChatHistoryResponseDto> {
    const [messages, total] = await Promise.all([
      this.chatHistoryRepository.find({
        where: { userId },
        take: limit,
        skip: offset,
        order: {
          savedAt: 'DESC',
        },
      }),
      this.chatHistoryRepository.count({
        where: { userId },
      }),
    ]);

    return {
      messages: messages
        .map((message) => ({
          content: message.message.content,
          role: message.role,
        }))
        .reverse(),
      total,
    };
  }
}
