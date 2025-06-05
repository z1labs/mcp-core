import { Module } from '@nestjs/common';

import { KmsModule } from 'modules/kms/kms.module';
import { TokensModule } from 'modules/tokens/tokens.module';

import { BalanceService } from './balance.service';
import { EvmUtils } from './evm.utils';
import { HyperswapUtils } from './hyperswap.utils';
import { OneInchUtils } from './oneinch.utils';
import { SonicUtils } from './sonic.utils';

@Module({
  imports: [KmsModule, TokensModule],
  providers: [BalanceService, EvmUtils, HyperswapUtils, OneInchUtils, SonicUtils],
  exports: [BalanceService, EvmUtils, HyperswapUtils, OneInchUtils, SonicUtils],
})
export class BalanceModule {}
