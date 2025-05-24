import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

import { SettingsService } from 'modules/settings/settings.service';

@Injectable()
export class VectorStoreService {
  private logger = new Logger(VectorStoreService.name);
  private openaiClient: OpenAI;
  initialized: boolean = false;

  constructor(private readonly settingsService: SettingsService) {
    const openaiApiKey = this.settingsService.getSettings().keys.openaiApiKey;

    if (!openaiApiKey) {
      this.logger.warn('OpenAI API key is not set');
      return;
    }

    this.initialized = true;

    this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
  }

  async embed(text: string): Promise<Array<number>> {
    const response = await this.openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  }

}
