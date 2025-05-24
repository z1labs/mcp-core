import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { VectorStoreService } from '../vector-store.service';

const bridgeInstruction = `runBridge() can transfer ERC20 and Native tokens between two different chains.

Examples of user request:
USER: I want to transfer 100 USDC from Ethereum to Arbitrum
USER: Bridge 100 DAI from Ethereum to Arbitrum
USER: Send money to <CHAIN_NAME> to address <ADDRESS>
USER: Bridge 1 eth on Arbitrum to eth Base
USER: Bridge 0.02 eth Ethereum to eth Polygon
USER: Bridge 258 ETH Base ETH Arbitrum
USER: I want to bridge all my USDC Base to Scroll
USER: I want to bridge 400 USDT on Polygon USDC Optimism
USER: I want to bridge 12 dai <CHAIN_NAME> to <CHAIN_NAME>

Examples of arguments:
{
    "userAddress": "0x1234567890",
    "originalChainName": "ethereum",
    "destinationChainName": "arbitrum",
    "tokenSymbolFrom": "USDC",
    "tokenSymbolTo": "USDC",
    "amount": "100" // in human readable format, not in wei
}
`;


const allInstructions = [bridgeInstruction];

@Injectable()
export class InstructionsRetriever implements OnModuleInit {
  private logger = new Logger(InstructionsRetriever.name);
  collectionName = 'instructions';
  constructor(private readonly vectorStoreService: VectorStoreService) { }

  async onModuleInit(): Promise<void> {
    if (!this.vectorStoreService.initialized) {
      return;
    }
  }
}
