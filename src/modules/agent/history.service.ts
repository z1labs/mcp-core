import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';

import { GptRoles } from 'modules/constants';
import { ChatHistory } from 'modules/database/entities/chat-history.entity';
import { ChatHistoryRepository } from 'modules/database/repository/chat-history.repository';
import { SettingsService } from 'modules/settings/settings.service';

import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from 'openai/resources';

export interface HistoryServiceParams {
  redisUrl: string;
}

@Injectable()
export class HistoryService {
  messagesLimit: number;
  constructor(
    private readonly settingsService: SettingsService,
    private readonly chatHistoryRepository: ChatHistoryRepository,
  ) {
    this.messagesLimit = this.settingsService.getSettings().gpt.historyMessages;
  }

  getSystemMessage(message: string): ChatCompletionMessageParam {
    return { role: GptRoles.SYSTEM, content: message };
  }

  getUserMessage(message: string): ChatCompletionMessageParam {
    return { role: GptRoles.USER, content: message };
  }

  getAssistantMessage(message: string): ChatCompletionMessageParam {
    return { role: GptRoles.ASSISTANT, content: message };
  }

  getAssistantMessageWithToolCalls(
    message: string,
    toolCalls: ChatCompletionMessageToolCall[],
  ): ChatCompletionMessageParam {
    return { role: GptRoles.ASSISTANT, content: message, tool_calls: toolCalls };
  }

  getToolMessage(message: string, toolCallId: string): ChatCompletionMessageParam {
    return { role: GptRoles.TOOL, content: message, tool_call_id: toolCallId };
  }

  public async saveHistory(userId: string, history: ChatCompletionMessageParam[]): Promise<void> {
    const baseDate = new Date(); // Start with a single base date
    let increment = 0; // Counter for incrementing time

    const newHistoryRecord: Partial<ChatHistory>[] = history.map((message) => {
      const recordDate = new Date(baseDate.getTime() + increment); // Increment by miliseconds
      increment++; // Increase increment for next record
      return {
        content: message.content,
        role: message.role as GptRoles,
        userId,
        message,
        savedAt: recordDate,
      };
    });

    await this.chatHistoryRepository.insert(newHistoryRecord);
  }

  public async getHistory(userId: string): Promise<ChatCompletionMessageParam[]> {
    const history = await this.chatHistoryRepository.find({
      where: { userId, role: Not(GptRoles.SYSTEM) },
      order: { savedAt: 'DESC' },
      take: this.messagesLimit,
    });
    return history.map((h) => h.message as ChatCompletionMessageParam).reverse();
  }
}
