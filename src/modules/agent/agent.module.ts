import { Module } from '@nestjs/common';

import { DatabaseModule } from 'modules/database/database.module';
import { UserModule } from 'modules/user/user.module';

import { ActionService } from './action.service';
import { AgentService } from './agent.service';
import { HistoryService } from './history.service';
import { ModelService } from './model.service';
import { ChainRetriever } from './retrievers/chain.retriever';
import { InstructionsOfflineRetriever } from './retrievers/instructions-offline.retriever';
import { InstructionsRetriever } from './retrievers/instructions.retriever';
import { WalletsRetriever } from './retrievers/wallets.retriever';
import { VectorStoreService } from './vector-store.service';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
  ],
  providers: [
    AgentService,
    ModelService,
    HistoryService,
    ActionService,
    VectorStoreService,
    InstructionsRetriever,
    InstructionsOfflineRetriever,
    WalletsRetriever,
    ChainRetriever,
  ],
  exports: [AgentService, ActionService],
})
export class AgentModule { }
