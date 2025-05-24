import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { UserSession } from 'common/decorators/user-session.decorator';
import { JwtGuard } from 'modules/auth/guards/jwt.guard';
import { User } from 'modules/database/entities/user.entity';

import { CreateWalletRequestDto, ImportWalletDto, WalletCreationResponseDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('create')
  @ApiResponse({ type: WalletCreationResponseDto })
  @ApiBody({ type: CreateWalletRequestDto })
  createWallet(@Body() body: CreateWalletRequestDto, @UserSession() user: User): Promise<WalletCreationResponseDto> {
    return this.walletService.createWallet(user, body.solana);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post('import')
  @ApiResponse({ type: WalletCreationResponseDto })
  @ApiBody({ type: ImportWalletDto })
  importWallet(@Body() body: ImportWalletDto, @UserSession() user: User): Promise<WalletCreationResponseDto> {
    return this.walletService.importWallet(body, user);
  }
}
