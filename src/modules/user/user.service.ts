import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';

import { EvmUtils } from 'modules/blockchain/evm.utils';
import { Account } from 'modules/database/entities/account.entity';
import { User } from 'modules/database/entities/user.entity';
import { AccountRepository } from 'modules/database/repository/account.repository';
import { UserRepository } from 'modules/database/repository/user.repository';
import { KmsService } from 'modules/kms/kms.service';

import { Logger } from '@nestjs/common';
import { ObservationRepository } from 'modules/database/repository/observation.repository';
import { PrivateKeyParam, UserIdAndAddressParam, UserIdParam } from './dto/params';

interface NewAccount {
  address: string;
  privateKey?: string;
}
interface TransferNotificationArgs {
  userAddress: string;
  userId: string;
}

interface TransferNotificationResponse {
  message: string;
}

@Injectable()
export class UserService {

  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly evmUtils: EvmUtils,
    private readonly kmsService: KmsService,
    private readonly observationRepository: ObservationRepository,
  ) { }

  // ToolMethod
  public async getUserWalletList(args: UserIdParam): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: args.userId }, relations: ['accounts'] });
    if (!user) throw new NotFoundException('User not found');
    return user.accounts.map((account) => account.address);
  }

  public getUserIdByAddress(address: string): Promise<string | null> {
    return this.userRepository.getUserIdByAddress(address);
  }

  public async getUsersByAddress(address: string): Promise<User[]> {
    const accounts = await this.accountRepository.find({
      where: { address: address.toLowerCase() },
      relations: ['user'],
    });
    return accounts.map((account) => account.user);
  }

  public async getUsersBySolanaAddress(address: string): Promise<User[]> {
    const accounts = await this.accountRepository.find({
      where: { address: address },
      relations: ['user'],
    });
    return accounts.map((account) => account.user);
  }

  public async createNewAccountForUser(args: UserIdParam): Promise<NewAccount> {
    const user = await this.getUserById(args.userId);
    if (!user) throw new NotFoundException('User not found');
    // const newAccount = args.solana ? await this.solanaUtils.generateAccount() : await this.evmUtils.generateAccount();
    const newAccount = await this.evmUtils.generateAccount();
    const account = new Account();
    // account.address = args.solana ? newAccount.address : newAccount.address.toLowerCase();
    account.address = newAccount.address.toLowerCase();
    account.encryptedKey = await this.kmsService.encryptSecret(newAccount.privateKey);
    account.user = user;

    await this.accountRepository.save(account);
    if (args.returnPrivateKey) return { address: newAccount.address, privateKey: newAccount.privateKey };
    return { address: newAccount.address };
  }

  // ToolMethod
  public async addNewAccountFromPrivateKey(args: PrivateKeyParam): Promise<NewAccount> {
    const user = await this.getUserById(args.userId);
    if (!user) throw new NotFoundException('User not found');

    const address = this.evmUtils.privateKeyToAddress(args.privateKey);
    const existedAccount = await this.accountRepository.findOne({
      where: { address: address.toLowerCase(), user: { id: args.userId } },
      relations: ['user'],
    });
    if (existedAccount) throw new HttpException('Account already exists', HttpStatus.CONFLICT);
    const account = new Account();
    account.address = address.toLowerCase();
    account.encryptedKey = await this.kmsService.encryptSecret(args.privateKey);
    account.user = user;

    await this.accountRepository.save(account);
    if (args.returnPrivateKey) return { address, privateKey: args.privateKey };
    return { address };
  }

  public async exportWalletPrivateKey(args: UserIdAndAddressParam): Promise<string> {
    const user = await this.getUserById(args.userId);
    if (!user) throw new NotFoundException('User not found');
    const wallet = await this.accountRepository.findOne({
      where: { user: { id: args.userId }, address: args.userAddress },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return this.kmsService.decryptSecret(wallet.encryptedKey);
  }

  // ToolMethod
  public async deleteUserWallet(args: UserIdAndAddressParam): Promise<string> {
    const account = await this.accountRepository.findOne({
      where: { user: { id: args.userId }, address: args.userAddress.toLowerCase() },
    });
    if (!account) throw new NotFoundException('Account not found');
    await this.accountRepository.delete(account.id);

    return 'Account deleted';
  }

  public async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.getUserById(userId);
  }

  public async getUserAccount(userId: string, address: string): Promise<Account> {
    return this.userRepository.getUserAccount(userId, address);
  }

  public getWhatCanIDo(): string {
    return `
      `;
  }
}
