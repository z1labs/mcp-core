import { Injectable } from '@nestjs/common';

import { BlockchainService } from 'modules/blockchain/blockchain.service';
import { EvmUtils } from 'modules/blockchain/evm.utils';
import { UserService } from 'modules/user/user.service';

import { IAction } from './types';

@Injectable()
export class ActionService {
  actions: IAction[] = [];
  constructor(
    private readonly userService: UserService,
    private readonly evmUtils: EvmUtils,
    private readonly blockchainService: BlockchainService,
  ) { }

  addAction(action: IAction): void {
    this.actions.push(action);
  }

  getActions(): IAction[] {
    return this.actions;
  }

  registerAllActions(): void {
    const allActions: IAction[] = [
      {
        toolSchema: {
          type: 'function',
          function: {
            name: 'getUserWalletList',
            description: 'Get the list of user wallets',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
        },
        func: this.userService.getUserWalletList.bind(this.userService),
      },
      {
        toolSchema: {
          type: 'function',
          function: {
            name: 'deleteUserWallet',
            description:
              'Before using the function, ask the user for additional confirmation. Proceed with deletion or execution only after the user explicitly approves the request.',
            parameters: {
              type: 'object',
              properties: {
                userAddress: { type: 'string', description: 'Address of the user wallet to delete' },
              },
              required: ['userAddress'],
            },
          },
        },
        func: this.userService.deleteUserWallet.bind(this.userService),
      },
    ];

    if (process.env.NODE_ENV === 'local') {
      this.actions.push({
        toolSchema: {
          type: 'function',
          function: {
            name: 'exportWalletPrivateKey',
            description: 'Export private key of specific wallet',
            parameters: {
              type: 'object',
              properties: {
                userAddress: { type: 'string', description: 'User address' },
              },
              required: ['userAddress'],
            },
          },
        },
        func: this.userService.exportWalletPrivateKey.bind(this.userService),
      });
    }

    this.actions.push(...allActions);
  }
}
