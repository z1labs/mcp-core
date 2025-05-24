import { Injectable, OnModuleInit } from '@nestjs/common';
import { config } from 'dotenv';

import { ReencryptWalletsService } from './reencrypt-wallets';
config();

@Injectable()
export class ScriptsService implements OnModuleInit {
  constructor(private readonly reencryptWallets: ReencryptWalletsService) {}

  async onModuleInit(): Promise<void> {
    await this.reencryptWallets.reencryptWallets();
  }
}
