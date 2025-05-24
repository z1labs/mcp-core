import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { SessionResponseDto } from './session.dto';

export class WorldJwtDto {
  @ApiProperty({
    example: 'access_token',
    description: 'The access token',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @ApiProperty({
    example: 'token_type',
    description: 'The token type',
  })
  @IsString()
  @IsNotEmpty()
  token_type: string;

  @ApiProperty({
    example: 'expires_in',
    description: 'The expires in',
  })
  @IsNumber()
  @IsNotEmpty()
  expires_in: number;

  @ApiProperty({
    example: 'scope',
    description: 'The scope',
  })
  @IsString()
  @IsNotEmpty()
  scope: string;

  @ApiProperty({
    example: 'id_token',
    description: 'The id token',
  })
  @IsString()
  @IsNotEmpty()
  id_token: string;
}

export class WorldUserInfoResponseDto {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
}
export class WorldExchangeResponseDto extends SessionResponseDto {
  @ApiProperty({
    type: WorldJwtDto,
  })
  jwt: WorldJwtDto;

  @ApiProperty({
    type: WorldUserInfoResponseDto,
  })
  userInfo: WorldUserInfoResponseDto;
}

export class ExchangeWorldCodeDto {
  @ApiProperty({
    description: 'The world code',
  })
  @IsString()
  @IsNotEmpty()
  public code: string;
}
