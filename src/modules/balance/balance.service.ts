import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { TokensService } from 'modules/tokens/tokens.service';

import { EvmUtils } from './evm.utils';

import { GetBalanceERC20Params, GetBalanceNativeParams } from './dto/params';

// Service for complex actions on the blockchain
@Injectable()
export class BalanceService implements OnModuleInit {

  constructor(private readonly evmUtils: EvmUtils, private readonly tokenService: TokensService) {}

  async onModuleInit(): Promise<void> {}

  public async getBalanceToken(args: GetBalanceERC20Params): Promise<string> {
    const { chainName, userAddress, contractAddressOrTokenSymbol } = args;
    let result = await this.tokenService.fetchTokenAddressByTicker({
      chainName: chainName,
      symbol: contractAddressOrTokenSymbol,
    });

    if (result.error || !result.address) {
      throw new Error(`Cannot find address for token symbol: ${contractAddressOrTokenSymbol}`);
    }

    const erc20Decimals = await this.evmUtils.getErc20Decimals(chainName, result.address);
    const balance = await this.evmUtils.getBalanceERC20(chainName, userAddress, result.address);
    return this.evmUtils.toEth(balance, erc20Decimals);
  }

  public async getBalanceNative(args: GetBalanceNativeParams): Promise<string> {
    const { chainName, address } = args;

    const balance = await this.evmUtils.getBalanceNative(chainName, address);
    return this.evmUtils.toEth(balance);
  }
}
