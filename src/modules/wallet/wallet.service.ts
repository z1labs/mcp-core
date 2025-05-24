import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { User } from 'modules/database/entities/user.entity';
import { UserService } from 'modules/user/user.service';

import { ImportWalletDto, WalletCreationResponseDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private readonly userService: UserService) {}

  async createWallet(user: User, solana?: boolean): Promise<WalletCreationResponseDto> {
    const result = await this.userService.createNewAccountForUser({
      userId: user.id,
      returnPrivateKey: true,
      solana,
    });
    if (!result.privateKey) throw new HttpException('Failed to create wallet', HttpStatus.INTERNAL_SERVER_ERROR);
    return {
      address: result.address,
      privateKey: result.privateKey,
    };
  }

  async importWallet(body: ImportWalletDto, user: User): Promise<WalletCreationResponseDto> {
    const { privateKey, solana } = body;
    const result = await this.userService.addNewAccountFromPrivateKey({
      userId: user.id,
      privateKey,
      returnPrivateKey: true,
      solana,
    });
    if (!result.privateKey) throw new HttpException('Failed to import wallet', HttpStatus.INTERNAL_SERVER_ERROR);
    return {
      address: result.address,
      privateKey: result.privateKey,
    };
  }
}
