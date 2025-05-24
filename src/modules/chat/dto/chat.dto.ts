import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendMessageRequestDto {
  @ApiProperty({
    description: 'The message content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class SendMessageResponseDto {
  @ApiProperty({
    description: 'The message content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatHistoryRequestDto {
  @ApiProperty({
    description: 'The limit of messages to fetch',
  })
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @ApiProperty({
    description: 'The offset of messages to fetch',
  })
  @IsNumber()
  @IsNotEmpty()
  offset: number;
}

export class ChatHistoryMessageDto {
  @ApiProperty({
    description: 'The chat history',
  })
  role: string;

  @ApiProperty({
    description: 'The message content',
  })
  content: string;
}

export class ChatHistoryResponseDto {
  @ApiProperty({
    description: 'The chat history',
  })
  @IsArray()
  @IsNotEmpty()
  messages: ChatHistoryMessageDto[];

  @ApiProperty({
    description: 'The total number of messages',
  })
  @IsNumber()
  @IsNotEmpty()
  total: number;
}
