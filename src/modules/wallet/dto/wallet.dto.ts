import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWalletRequestDto {
  @ApiPropertyOptional({
    description: 'If true, create a solana account',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  solana?: boolean;
}

export class ImportWalletDto {
  @ApiProperty({ description: 'The private key of the wallet' })
  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @ApiPropertyOptional({
    description: 'If true, create a solana account',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  solana?: boolean;
}

export class WalletCreationResponseDto {
  @ApiProperty({ description: 'The address of the wallet' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'The private key of the wallet' })
  @IsString()
  @IsNotEmpty()
  privateKey: string;
}
