import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import { OpenAI } from 'openai';
import { v4 as uuid } from 'uuid';

import { SettingsService } from 'modules/settings/settings.service';

import { ActionService } from './action.service';
import { HistoryService } from './history.service';
import { IAction } from './types';

import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources';

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);
  DEFAULT_THREAD_ID = 'default';
  isDeepSeek = false;
  client: OpenAI;
  model: string;
  actions: IAction[] = [];

  constructor(
    private readonly settingsService: SettingsService,
    private readonly memory: HistoryService,
    private readonly actionService: ActionService,
  ) {
    const model = this.settingsService.getSettings().gpt.model;
    const openAIKey = this.settingsService.getSettings().keys.openaiApiKey;
    const deepSeekApiKey = this.settingsService.getSettings().keys.deepSeekApiKey;

    if (deepSeekApiKey && model.includes('deepseek')) {
      this.isDeepSeek = true;
    }

    if (this.isDeepSeek) {
      this.client = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: deepSeekApiKey,
      });
    } else {
      this.client = new OpenAI({
        apiKey: openAIKey,
      });
    }
    this.model = model;
    this.initActions();
  }

  initActions(): void {
    this.actionService.registerAllActions();
    this.actions = this.actionService.getActions();
  }

  /**
   * Run completions.
   * For memory usage threadId must be passed.
   */
  async run(
    messages: ChatCompletionMessageParam[],
    ctxParams?: Record<string, unknown>,
  ): Promise<ChatCompletionMessageParam[]> {
    while (true) {
      // Get completions
      const completionParams: ChatCompletionCreateParamsNonStreaming = {
        model: this.model,
        messages,
      };
      if (this.actions.length > 0) {
        const tools = this.actions.map((t) => t.toolSchema);
        completionParams.tools = tools;
      }
      const completion = await this.client.chat.completions.create(completionParams);

      // Check result
      const finishReason = completion.choices[0].finish_reason;
      const isStopDetected = finishReason === 'stop';
      const isContentFilter = finishReason === 'content_filter';
      const isLength = finishReason === 'length';
      let isCustomResultMessage = false;

      const isToolDetected =
        completion.choices[0].message.tool_calls && completion.choices[0].message.tool_calls.length > 0;

      // Handle tool call
      if (isToolDetected) {
        const toolCalls = completion.choices[0].message.tool_calls as ChatCompletionMessageToolCall[];
        messages.push(
          this.memory.getAssistantMessageWithToolCalls(completion.choices[0].message.content ?? '', toolCalls),
        );

        // Run tool one by one
        // Promise.all is not used because in without it we have more control over exceptions
        for (const toolCall of toolCalls) {
          const action = this.getActionByName(toolCall.function.name);
          const actionArgs = this.getActionArgs(toolCall, ctxParams);
          this.logger.log(
            ` -> Action: ${action.toolSchema.function.name} args: ${JSON.stringify(actionArgs, null, 2)}`,
          );
          let actionResult: string;
          try {
            const result = await action.func(actionArgs);
            actionResult = JSON.stringify(result);
            messages.push(this.memory.getToolMessage(actionResult, toolCall.id));
            if (result?.customMessage) {
              messages.push(this.memory.getAssistantMessage(result?.content ?? ''));
              isCustomResultMessage = true;
            }
            this.logger.log(` -> Action result: ${actionResult}`);
          } catch (error) {
            const err = error as Error;
            this.logger.error(err.message);
            actionResult = JSON.stringify({ error: err.message });
            messages.push(this.memory.getToolMessage(actionResult, toolCall.id));
          }

          // Add tool result to history
          // messages.push(this.memory.getToolMessage(actionResult, toolCall.id));
        }
      }

      if (isStopDetected || isContentFilter || isLength || isCustomResultMessage) {
        if (!isCustomResultMessage) {
          messages.push(this.memory.getAssistantMessage(completion.choices[0].message.content ?? ''));
        }
        break;
      }
    }

    return messages;
  }

  private getActionByName(name: string): IAction {
    const action = this.actions.find((action) => action.toolSchema.function.name === name);
    if (!action) {
      throw new Error(`Action with name ${name} not found`);
    }
    return action;
  }



  private getActionArgs(
    toolCall: ChatCompletionMessageToolCall,
    ctx?: Record<string, unknown>,
  ): Record<string, unknown> {
    const toolArgs: Record<string, any> = JSON.parse(toolCall.function.arguments);

    if (ctx) {
      for (const key of Object.keys(ctx)) {
        toolArgs[key] = ctx[key];
      }
    }

    return toolArgs;
  }

  async transcribeAudioFile(filePath: string): Promise<string> {
    const audioFile = await fs.readFile(filePath);
    const fileName = `${uuid()}.mp3`;
    const tempFilePath = `/tmp/${fileName}`;
    await fs.writeFile(tempFilePath, audioFile);

    try {
      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(tempFilePath)
      });
      return response.text;
    } catch (error) {
      this.logger.error('Whisper transcription failed', error);
      throw error;
    } finally {
      await fs.remove(tempFilePath);
    }
  }
}
