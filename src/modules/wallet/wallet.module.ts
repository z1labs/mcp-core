import { Module } from '@nestjs/common';

import { AuthModule } from 'modules/auth/auth.module';
import { UserModule } from 'modules/user/user.module';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
