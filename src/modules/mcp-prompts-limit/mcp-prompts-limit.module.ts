import { Module } from '@nestjs/common';

import { DatabaseModule } from 'modules/database/database.module';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
import { SettingsModule } from 'modules/settings/settings.module';
import { KmsModule } from 'modules/kms/kms.module';
import { McpPromptsLimitService } from './mcp-prompts-limit.service';

@Module({
  imports: [DatabaseModule, BlockchainModule, SettingsModule, KmsModule],
  providers: [McpPromptsLimitService],
  exports: [McpPromptsLimitService],
})
export class McpPromptsLimitModule {}
