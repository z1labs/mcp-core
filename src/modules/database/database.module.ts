import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { HttpModule } from '@nestjs/axios';
import { ormConfigOptions } from './database.orm.config';
import { AccountSettings } from './entities/account-settings.entity';
import { Account } from './entities/account.entity';
import { AcrossDeposit } from './entities/across-deposit.entity';
import { ChatHistory } from './entities/chat-history.entity';
import { DcaSubscription } from './entities/dca-subscription.entity';
import { Erc20 } from './entities/erc20.entity';
import { Pool } from './entities/hyperswap-pool.entity';
import { Notification } from './entities/notification.entity';
import { Observation } from './entities/observation.entity';
import { ServiceAccount } from './entities/service-account.entity';
import { Session } from './entities/session.entity';
import { SwapOrder } from './entities/swap-order.entity';
import { UserChannel } from './entities/user-channel.entity';
import { UserMarkets } from './entities/user-markets.entity';
import { User } from './entities/user.entity';
import { AccountSettingsRepository } from './repository/account-settings.repository';
import { AccountRepository } from './repository/account.repository';
import { AcrossDepositRepository } from './repository/across-deposit.repository';
import { ChatHistoryRepository } from './repository/chat-history.repository';
import { DcaSubscriptionRepository } from './repository/dca-subscription.repository';
import { Erc20Repository } from './repository/erc20.repository';
import { PoolRepository } from './repository/hyperswap-pool.repository';
import { NotificationRepository } from './repository/notification.repository';
import { ObservationRepository } from './repository/observation.repository';
import { ServiceAccountRepository } from './repository/service-account.repository';
import { SessionRepository } from './repository/session.entity';
import { SwapOrderRepository } from './repository/swap-order.repository';
import { UserChannelRepository } from './repository/user-channel.repository';
import { UserMarketsRepository } from './repository/user-markets.repository';
import { UserRepository } from './repository/user.repository';
import { SeedService } from './seed';
import { SeedErc20VerifiedService } from './seeds/seed-erc20-verified';
import { SeedPoolsVerifiedService } from './seeds/seed-hyperSwap-verified';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...ormConfigOptions,
        isGlobal: true, // Make the TypeOrmModule global
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    TypeOrmModule.forFeature([
      Account,
      ServiceAccount,
      User,
      Session,
      AcrossDeposit,
      Erc20,
      Pool,
      UserChannel,
      UserMarkets,
      ChatHistory,
      SwapOrder,
      AccountSettings,
      Notification,
      DcaSubscription,
      Observation
    ]),
    HttpModule
  ],
  providers: [
    SeedPoolsVerifiedService,
    SeedErc20VerifiedService,
    SeedService,
    AccountRepository,
    ServiceAccountRepository,
    UserRepository,
    UserChannelRepository,
    SessionRepository,
    AcrossDepositRepository,
    Erc20Repository,
    PoolRepository,
    UserMarketsRepository,
    ChatHistoryRepository,
    SwapOrderRepository,
    AccountSettingsRepository,
    NotificationRepository,
    DcaSubscriptionRepository,
    ObservationRepository
  ],
  exports: [
    AccountRepository,
    ServiceAccountRepository,
    UserRepository,
    UserChannelRepository,
    SessionRepository,
    AcrossDepositRepository,
    Erc20Repository,
    PoolRepository,
    UserMarketsRepository,
    ChatHistoryRepository,
    SwapOrderRepository,
    AccountSettingsRepository,
    NotificationRepository,
    DcaSubscriptionRepository,
    ObservationRepository
  ],
})
export class DatabaseModule { }
