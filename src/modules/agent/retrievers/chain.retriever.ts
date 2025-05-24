import { Injectable } from '@nestjs/common';

import { ChainNames, getChainIdByName } from 'modules/blockchain/constants';

import { IAugmentData } from './types';

const augmentData: IAugmentData = {
  contextKey: 'AVAILABLE_CHAINS',
  system: `chain_name and chain_id:
${ChainNames.SONIC} ${getChainIdByName(ChainNames.SONIC)}
${ChainNames.ETHEREUM} ${getChainIdByName(ChainNames.ETHEREUM)}
${ChainNames.ARBITRUM} ${getChainIdByName(ChainNames.ARBITRUM)}
${ChainNames.BASE} ${getChainIdByName(ChainNames.BASE)}
${ChainNames.OPTIMISM} ${getChainIdByName(ChainNames.OPTIMISM)}
${ChainNames.ZKSYNC} ${getChainIdByName(ChainNames.ZKSYNC)}
${ChainNames.POLYGON} ${getChainIdByName(ChainNames.POLYGON)}
${ChainNames.SCROLL} ${getChainIdByName(ChainNames.SCROLL)}
${ChainNames.BSC} ${getChainIdByName(ChainNames.BSC)}
${ChainNames.GNOSIS} ${getChainIdByName(ChainNames.GNOSIS)}
${ChainNames.AVALANCHE} ${getChainIdByName(ChainNames.AVALANCHE)}
${ChainNames.FANTOM} ${getChainIdByName(ChainNames.FANTOM)}
${ChainNames.AURORA} ${getChainIdByName(ChainNames.AURORA)}
${ChainNames.SOLANA} ${getChainIdByName(ChainNames.SOLANA)}
${ChainNames.HYPER} ${getChainIdByName(ChainNames.HYPER)}`,
};

@Injectable()
export class ChainRetriever {
  constructor() { }

  public async retrieve(): Promise<IAugmentData[]> {
    return [augmentData];
  }
}
