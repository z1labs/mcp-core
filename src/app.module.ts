import { Module, OnModuleInit } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from 'app.controller';
import { AgentModule } from 'modules/agent/agent.module';
import { AuthModule } from 'modules/auth/auth.module';
import { DatabaseModule } from 'modules/database/database.module';
import { KmsModule } from 'modules/kms/kms.module';
import { SettingsModule } from 'modules/settings/settings.module';
import { WalletModule } from 'modules/wallet/wallet.module';

import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { ScriptsModule } from './modules/scripts/scripts.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    SettingsModule,
    AuthModule,
    DatabaseModule,
    KmsModule,
    ChatModule,
    UserModule,
    AgentModule,
    WalletModule,
    ScriptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor() { }

  async onModuleInit(): Promise<void> { }
}
