import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SessionWithSignDto {
  @ApiProperty({
    example: 'qwe.asd.zxc',
    description: 'Signature',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiPropertyOptional({
    example: '0x65fe43dbbfe6b073c3a84ccab88ddc4257d41261',
    description: 'User public key',
  })
  @IsString()
  @IsOptional()
  publicKey?: string;

  @ApiPropertyOptional({
    example: 'Hello, world!',
    description: 'Message to sign',
  })
  @IsString()
  @IsOptional()
  message?: string;
}

export class SessionWithAddressDto {
  @ApiProperty({
    example: '0x65fe43dbbfe6b073c3a84ccab88ddc4257d41261',
    description: 'User address',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class SessionResponseDto {
  @ApiProperty({
    example: 'qwe.asd.zxc',
    description: 'The JWT token',
  })
  @IsString()
  @IsNotEmpty()
  jwtToken: string;

  @ApiProperty({
    example: 'qwe.asd.zxc',
    description: 'The refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class SessionResponseWithWorldDto extends SessionResponseDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'user world email',
  })
  jwt: string;
}
