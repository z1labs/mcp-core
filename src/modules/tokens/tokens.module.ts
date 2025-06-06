import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EvmUtils } from 'modules/balance/evm.utils';
import { Erc20 } from 'modules/database/entities/erc20.entity';
import { HyperswapUtils } from 'modules/balance/hyperswap.utils';
import { OneInchUtils } from 'modules/balance/oneinch.utils';
import { SonicUtils } from 'modules/balance/sonic.utils';
import { TokensService } from './tokens.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Erc20])],
  providers: [TokensService, SonicUtils, HyperswapUtils, OneInchUtils, EvmUtils],
  exports: [TokensService],
})
export class TokensModule {}
