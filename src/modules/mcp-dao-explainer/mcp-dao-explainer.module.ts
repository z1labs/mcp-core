import { Module } from '@nestjs/common';
import { McpDaoExplainerService } from './mcp-dao-explainer.service';

@Module({
  providers: [McpDaoExplainerService],
  exports: [McpDaoExplainerService],
})
export class McpDaoExplainerModule {}
