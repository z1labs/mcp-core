import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bs58 from 'bs58';
import { sign } from 'tweetnacl';
import Web3Token from 'web3-token';

import { Session } from 'modules/database/entities/session.entity';
import { User } from 'modules/database/entities/user.entity';
import { SessionRepository } from 'modules/database/repository/session.entity';
import { UserRepository } from 'modules/database/repository/user.repository';

import { SessionResponseDto } from './dto/session.dto';
import { JwtPair } from './types';

interface EncryptedBody {
  uri: string;
  'web3-token-version': string;
  'issued-at': string;
  'expiration-time': string;
  statement: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  public async createSessionWithSign(
    signature: string,
    publicKey?: string,
    message?: string,
  ): Promise<SessionResponseDto> {
    if (publicKey && message) {
      // This is solana
      const isTokenValid = sign.detached.verify(
        new TextEncoder().encode(message),
        bs58.decode(signature),
        bs58.decode(publicKey),
      );
      if (!isTokenValid) {
        throw new HttpException('Invalid solana signature', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userRepository.createOrGetUserByAddress(publicKey);
      const { jwtToken, refreshToken } = await this.createSession(user.id);
      return { jwtToken, refreshToken };
    } else {
      const userAddress = this.verifySignature(signature);
      if (!userAddress) {
        throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
      }
      const user = await this.userRepository.createOrGetUserByAddress(userAddress.toLowerCase());
      const { jwtToken, refreshToken } = await this.createSession(user.id);
      return { jwtToken, refreshToken };
    }
  }

  public async createSession(userId: string): Promise<Session> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const tokenPair = this.generateJwtPair(userId);
    const session = new Session();
    session.user = user;
    session.jwtToken = tokenPair.accessToken;
    session.refreshToken = tokenPair.refreshToken;
    // expired now + 30d
    session.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const savedSession = await this.sessionRepository.save(session);
    savedSession.user = user;
    return savedSession;
  }

  public async refreshSession(refreshToken: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      relations: ['user'],
      where: {
        refreshToken,
      },
    });
    if (!session) {
      throw new Error('Session not found');
    }
    if (session.expirationDate.getTime() < Date.now()) {
      throw new Error('Session expired');
    }
    const tokenPair = this.generateJwtPair(session.user.id);
    session.jwtToken = tokenPair.accessToken;
    session.refreshToken = tokenPair.refreshToken;
    session.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return await this.sessionRepository.save(session);
  }

  public async revokeSession(user: User, refreshToken: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        refreshToken,
        user: { id: user.id },
      },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.sessionRepository.delete({ refreshToken });
  }

  public async removeAllSessions(userId: string): Promise<void> {
    await this.sessionRepository.delete({
      user: {
        id: userId,
      },
    });
  }

  public async userJwtGuard(jwtToken?: string): Promise<User | null> {
    if (!jwtToken) {
      return null;
    }

    // Verify the JWT token
    let payload;
    try {
      payload = this.jwtService.verify(jwtToken);
      if (!payload) {
        return null;
      }
    } catch (err) {
      return null;
    }

    // Retrieve the session from the database
    const user = await this.userRepository.findOne({
      where: {
        id: payload.userId,
      },
      relations: ['sessions'],
    });

    const session = user?.sessions.find((s) => s.jwtToken === jwtToken);
    if (!session) {
      return null;
    }

    return user;
  }

  public async createMessageForSign(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return user.id;
  }

  private generateJwtPair(userId: string): JwtPair {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign({ userId }, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  public verifySignature(signature: string): string | null {
    try {
      const { address, body } = Web3Token.verify(signature);
      const bodyParsed = body as EncryptedBody;
      const currentTime = new Date();
      const expirationTime = new Date(bodyParsed['expiration-time']);
      if (currentTime > expirationTime) {
        return null;
      }
      return address.toLowerCase();
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }
}
