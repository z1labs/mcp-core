import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ChainNames } from '../constants';

export class GetBalanceERC20Params {
  chainName: ChainNames;
  userAddress: string;
  contractAddressOrTokenSymbol: string;
  userId: string;
}

export class GetBalanceNativeParams {
  chainName: ChainNames;
  address: string;
  userId: string;
}

export class TokenMetadataDto {
  @ApiProperty({
    description: 'Token address',
    example: '0xBaseTokenAddress...',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Token name',
    example: 'Sillybird',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Token symbol',
    example: 'SIB',
  })
  @IsString()
  symbol: string;
}
