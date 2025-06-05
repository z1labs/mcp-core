import { Injectable } from '@nestjs/common';
import { PoolRepository } from 'modules/database/repository/hyperswap-pool.repository';

@Injectable()
export class HyperswapUtils {
  constructor(private readonly poolRepository: PoolRepository) {}

  public async resolveTokenAddress(tokenSymbolOrAddress: string): Promise<{
    address: string;
    isNative: boolean;
  }> {
    if (tokenSymbolOrAddress.slice(0, 2) === '0x') {
      if (tokenSymbolOrAddress.trim().toLowerCase() === '0x5555555555555555555555555555555555555555') {
        return { address: '0x5555555555555555555555555555555555555555', isNative: true };
      }
      return { address: tokenSymbolOrAddress, isNative: false };
    }

    if (tokenSymbolOrAddress.trim().toLowerCase() === 'hype') {
      return { address: '0x5555555555555555555555555555555555555555', isNative: true };
    }

    if (tokenSymbolOrAddress.trim().toLowerCase() === 'whype') {
      return { address: '0x5555555555555555555555555555555555555555', isNative: false };
    }
    const tokenAddresses = await this.poolRepository.findTokenAddressesBySymbol(tokenSymbolOrAddress);

    if (tokenAddresses.length > 1) {
      throw new Error(
        `Multiple token addresses found for ${tokenSymbolOrAddress}. ` +
          `Provide the address instead. Available addresses: ${tokenAddresses.join(', ')}`,
      );
    }

    if (!tokenAddresses.length) {
      throw new Error(`No address found for token symbol: ${tokenSymbolOrAddress}`);
    }

    return { address: tokenAddresses[0], isNative: false };
  }
}
