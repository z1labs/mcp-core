import { Injectable, Logger } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';

import { ChatHistoryRepository } from 'modules/database/repository/chat-history.repository';
import { ChatLimitRepository } from 'modules/database/repository/chat-limit.repository';
import { GptRoles } from 'modules/constants';
import { ChatLimit } from 'modules/database/entities/chat-limit.entity';

@Injectable()
export class McpPromptsLimitService {
  private readonly logger = new Logger(McpPromptsLimitService.name);

  constructor(
    private readonly chatHistoryRepository: ChatHistoryRepository,
    private readonly chatLimitRepository: ChatLimitRepository,
  ) {}

  private async getOrCreateLimit(userId: string): Promise<ChatLimit> {
    const now = new Date();
    let limit = await this.chatLimitRepository.findOne({ where: { userId } });
    if (!limit) {
      limit = await this.chatLimitRepository.save({
        userId,
        limit: 20,
        resetAt: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)),
      } as ChatLimit);
    }
    if (limit.resetAt <= now) {
      limit.resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      await this.chatLimitRepository.save(limit);
    }
    return limit;
  }

  public async consumePrompt(userId: string): Promise<{ allow: boolean; message?: string }> {
    const limit = await this.getOrCreateLimit(userId);
    const now = new Date();
    const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const used = await this.chatHistoryRepository.count({
      where: {
        userId,
        role: GptRoles.USER,
        savedAt: MoreThanOrEqual(dayStart),
      },
    });

    if (used >= limit.limit) {
      return { allow: false, message: "You’ve reached your daily limit of free prompts. A new batch will unlock at 00:00 UTC" };
    }

    return { allow: true };
  }
}
