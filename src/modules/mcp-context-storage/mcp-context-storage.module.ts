import { Module } from '@nestjs/common';

import { McpContextStorageService } from './mcp-context-storage.service';
import { EvmUtils } from 'modules/blockchain/evm.utils';
import { KmsModule } from 'modules/kms/kms.module';
import { DatabaseModule } from 'modules/database/database.module';

@Module({
  imports: [KmsModule, DatabaseModule],
  providers: [McpContextStorageService, EvmUtils],
  exports: [McpContextStorageService],
})
export class McpContextStorageModule {}
