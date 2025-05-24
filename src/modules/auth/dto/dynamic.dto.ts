import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeDynamicJwtDto {
  @ApiProperty({
    description: 'The dynamic JWT token',
  })
  @IsString()
  @IsNotEmpty()
  public dynamicJwt: string;
}
