import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { UserSession } from 'common/decorators/user-session.decorator';
import { User } from 'modules/database/entities/user.entity';
import { UserRepository } from 'modules/database/repository/user.repository';

import { AuthService } from './auth.service';
import { SessionResponseDto, SessionWithAddressDto, SessionWithSignDto } from './dto/session.dto';
import { SuccessDto } from './dto/success.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('chat')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('generate-session-with-sign')
  @ApiResponse({
    status: 200,
    description: 'Successfully generated a session',
    type: SessionResponseDto,
  })
  @ApiBody({ type: SessionWithSignDto })
  public async generateSessionWithSign(@Body() body: SessionWithSignDto): Promise<SessionResponseDto> {
    return await this.authService.createSessionWithSign(body.signature, body.publicKey, body.message);
  }

  @Post('generate-test-session-with-address')
  @ApiResponse({
    status: 200,
    description: 'Successfully generated a session',
    type: SessionResponseDto,
  })
  public async generateSessionWithAddress(@Body() body: SessionWithAddressDto): Promise<SessionResponseDto> {
    const user = await this.userRepository.createOrGetUserByAddress(body.address);
    const { jwtToken, refreshToken } = await this.authService.createSession(user.id);
    return { jwtToken, refreshToken };
  }

  @Get('refresh-token')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed the session',
    type: SessionResponseDto,
  })
  public async refreshToken(@Query('refreshToken') refreshToken: string): Promise<SessionResponseDto> {
    const session = await this.authService.refreshSession(refreshToken);
    return { jwtToken: session.jwtToken, refreshToken: session.refreshToken };
  }

  @Get('revoke-token')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully revoked the session',
    type: SuccessDto,
  })
  public async revokeToken(
    @Query('refreshToken') refreshToken: string,
    @UserSession() user: User,
  ): Promise<SuccessDto> {
    await this.authService.revokeSession(user, refreshToken);
    return { success: true };
  }
}
