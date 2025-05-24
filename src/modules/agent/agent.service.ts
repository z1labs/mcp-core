import { Injectable, Logger } from '@nestjs/common';
import Mustache from 'mustache';

import { GptRoles } from 'modules/constants';

import { ActionService } from './action.service';
import { HistoryService } from './history.service';
import { ModelService } from './model.service';
import { ChainRetriever } from './retrievers/chain.retriever';
import { InstructionsOfflineRetriever } from './retrievers/instructions-offline.retriever';
import { IAugmentData } from './retrievers/types';
import { WalletsRetriever } from './retrievers/wallets.retriever';
import { isTool, isToolCall } from './utils';

import type { ChatCompletionMessageParam } from 'openai/resources/chat';

const DEFAULT_SYSTEM_PROMPT_TEMPLATE = `You are a blockchain expert which can help with blockchain related questions, create wallets, transfer and deploy tokens,
Don't use phrase like "if you need more information" or "let me know if you need". Be strict and professional.
{{systemRag}}`;

const DEFAULT_USER_PROMPT_TEMPLATE = `CONTEXT:
{{userRag}}

USER:
{{userPrompt}}`;

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly historyService: HistoryService,
    private readonly modelService: ModelService,
    private readonly actionService: ActionService,
    private readonly chainRetriever: ChainRetriever,
    private readonly instructionsOfflineRetriever: InstructionsOfflineRetriever,
    private readonly walletsRetriever: WalletsRetriever,
  ) { }

  async run(userId: string, message: string, ctxParams?: Record<string, unknown>): Promise<string> {
    const history = await this.historyService.getHistory(userId);

    this.logger.log(` -> Input: User: ${userId}, history length: ${history.length}`);
    message += `\r\n User id: ${userId}`;

    let markAsFalse = false;
    const correctedHistory: ChatCompletionMessageParam[] = history.filter((message, index) => {
      const lastMessage = history[index - 1];
      const nextMessage = history[index + 1];

      // Check first message
      if (index === 0) {
        if (isTool(message)) {
          markAsFalse = true;
          return false;
        }
        return true;
      }

      if (markAsFalse && !isTool(message)) {
        markAsFalse = false;
        return true;
      }

      if (markAsFalse) {
        return false;
      }

      if (isTool(message)) {
        if (isToolCall(lastMessage) || isTool(lastMessage)) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    });

    // ========= RAG =========
    // Apply all rag data at once from all retrievers
    const augmentedDataRaw: IAugmentData[][] = await Promise.all([
      this.chainRetriever.retrieve(),
      this.instructionsOfflineRetriever.retrieve(),
      this.walletsRetriever.retrieve(userId),
    ]);
    const augmentedData = augmentedDataRaw.flat();

    const userAugmentedData = augmentedData.filter((data) => data.user);
    const systemAugmentedData = augmentedData.filter((data) => data.system);

    // Modify every input with mustaches
    const allUserRag = userAugmentedData.map((data) => `[${data.contextKey}:] ${data.user}`).join('\n');
    const allSystemRag = systemAugmentedData.map((data) => `[${data.contextKey}:] ${data.system}`).join('\n');

    // Apply templates
    const userMessageText =
      allUserRag.length > 0
        ? Mustache.render(DEFAULT_USER_PROMPT_TEMPLATE, {
          userRag: allUserRag,
          userPrompt: message,
        })
        : message;
    const userMessage: ChatCompletionMessageParam = { role: GptRoles.USER, content: userMessageText };

    const systemMessageText = Mustache.render(DEFAULT_SYSTEM_PROMPT_TEMPLATE, {
      systemRag: allSystemRag,
    });
    const systemMessage: ChatCompletionMessageParam = { role: GptRoles.SYSTEM, content: systemMessageText };
    this.logger.log(` -> User Message: ${userMessageText}`);
    this.logger.log(
      ` -> System Message contain RAG data: \n${systemAugmentedData.map((data) => data.contextKey).join('\n')}`,
    );

    // Run agent
    const aiMessagesContext: ChatCompletionMessageParam[] = [systemMessage, ...correctedHistory, userMessage];
    const inputMessagesLength = aiMessagesContext.length - 1;

    const messages = await this.modelService.run(aiMessagesContext, ctxParams);

    const newMessagesCount = messages.length - inputMessagesLength;
    const newMessages = messages.slice(-newMessagesCount);

    // Save response
    // Messages to save exclude system messages
    const messagesToSave = [systemMessage, ...newMessages].filter((m) => m.role !== GptRoles.SYSTEM);
    await this.historyService.saveHistory(userId, messagesToSave);

    // return latest message
    const latestMessage = newMessages[newMessages.length - 1];
    if (!latestMessage.content) {
      throw new Error('Latest message is empty');
    }
    this.logger.log(` -> Output: ${latestMessage.content}`);
    return latestMessage.content as unknown as string;
  }

  async transcribeAudioFile(filePath: string): Promise<string> {
    return await this.modelService.transcribeAudioFile(filePath);
  }
}
