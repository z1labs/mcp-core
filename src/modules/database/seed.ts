import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { SeedErc20VerifiedService } from './seeds/seed-erc20-verified';
import { SeedPoolsVerifiedService } from './seeds/seed-hyperSwap-verified';
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  constructor(private readonly seedErc20VerifiedService: SeedErc20VerifiedService, private readonly seedPoolsVerifiedService: SeedPoolsVerifiedService) { }

  async onModuleInit(): Promise<void> {
    // try {
    //   await this.seedErc20VerifiedService.seed();
    // } catch (err) {
    //   const error = err as Error;
    //   this.logger.error(error.message);
    // }

    try {
      await this.seedPoolsVerifiedService.seed();
    } catch (err) {
      const error = err as Error;
      this.logger.error(error.message);
    }
  }
}
