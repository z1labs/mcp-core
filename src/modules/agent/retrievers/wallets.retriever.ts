import { Injectable } from '@nestjs/common';

import { AccountRepository } from 'modules/database/repository/account.repository';
import { UserRepository } from 'modules/database/repository/user.repository';

import { IAugmentData } from './types';

@Injectable()
export class WalletsRetriever {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async retrieve(userId: string): Promise<IAugmentData[]> {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['accounts'] });
    if (!user) {
      throw new Error('User not found');
    }

    const evmAccountsAddresses = user.accounts
      .filter((account) => account.address.startsWith('0x'))
      .map((account) => account.address);

    const solanaAccountsAddresses = user.accounts
      .filter((account) => !account.address.startsWith('0x'))
      .map((account) => account.address);

    const augmentedData: IAugmentData[] = [
      {
        contextKey: 'USER_EVM_ACCOUNTS',
        system: evmAccountsAddresses.join(', '),
      },
      {
        contextKey: 'USER_SOLANA_ACCOUNTS',
        system: solanaAccountsAddresses.join(', '),
      },
    ];

    return augmentedData;
  }
}
