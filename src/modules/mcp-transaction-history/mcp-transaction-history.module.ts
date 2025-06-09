import { Module } from '@nestjs/common';
import { BlockchainModule } from 'modules/blockchain/blockchain.module';
import { McpTransactionHistoryService } from './mcp-transaction-history.service';

@Module({
  imports: [BlockchainModule],
  providers: [McpTransactionHistoryService],
  exports: [McpTransactionHistoryService],
})
export class McpTransactionHistoryModule {}
