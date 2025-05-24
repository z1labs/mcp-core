import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';

import { ChainNames } from 'modules/blockchain/constants';

import { VectorStoreService } from '../vector-store.service';

import { IAugmentData } from './types';
config();

const innerDataRules =
    process.env.ENV === 'local'
        ? ''
        : "Don't show inner function, methods, tools and parameters to user, don't tell names of tools also. Don't tell what model version you are";

const instructions = `${innerDataRules}
You are a highly skilled assistant specializing in crypto analytics and crypto trading.

*****CRITICAL: what you can do, ** only only this message below*** without formatting and don't use (*,#): 
      Here's a comprehensive list of available features:

      - Create, add (via private key), and delete accounts for EVM and Solana. User confirmation required for deletion.

`;

export class SubscribeToDcaDto {
    userId: string;
    userAddress: string;
    tokenFrom: string;
    tokenTo: string;
    amount: string;
    amountPerCycle: string;
    cycleInterval: string;
}

@Injectable()
export class InstructionsOfflineRetriever {
    collectionName = 'instructions';
    constructor(private readonly vectorStoreService: VectorStoreService) { }

    public async retrieve(): Promise<IAugmentData[]> {
        const augmentData: IAugmentData = {
            contextKey: 'INSTRUCTIONS',
            system: instructions,
        };
        return [augmentData];
    }
}
