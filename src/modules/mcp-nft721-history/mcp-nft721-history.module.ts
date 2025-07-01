import { Module } from '@nestjs/common';

import { McpNft721HistoryService } from './mcp-nft721-history.service';
import { EvmUtils } from 'modules/blockchain/evm.utils';
import { KmsModule } from 'modules/kms/kms.module';
import { DatabaseModule } from 'modules/database/database.module';

@Module({
  imports: [KmsModule, DatabaseModule],
  providers: [McpNft721HistoryService, EvmUtils],
  exports: [McpNft721HistoryService],
})
export class McpNft721HistoryModule {}
