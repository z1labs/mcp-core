import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import * as path from 'path';

config();

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

const HOST = process.env.DB_HOST;
const PORT = process.env.DB_PORT;
const NAME = process.env.DB_NAME;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const REJECT_UNAUTHORIZED = process.env.DB_REJECT_UNAUTHORIZED;

if (!HOST || !PORT || !NAME || !USER || !PASSWORD) {
  throw new Error('Missing database credentials');
}

const options: DataSourceOptions = {
  type: 'postgres',
  host: HOST,
  port: parseInt(PORT),
  database: NAME,
  username: USER,
  password: PASSWORD,
  entities: [
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
  ], // Define entities explicitly
  migrations: [path.resolve(__dirname, 'migrations', '**', '*{.ts,.js}')],
  logging: false,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  ssl: REJECT_UNAUTHORIZED === 'false' ? { rejectUnauthorized: false } : undefined,
};

export const ormConfigOptions: TypeOrmModuleOptions = options;

const dataSource = new DataSource(options);
export default dataSource;
