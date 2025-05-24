import { Module } from '@nestjs/common';

import { ReencryptWalletsService } from './reencrypt-wallets';
import { ScriptsService } from './scripts.service';

@Module({
  providers: [ScriptsService, ReencryptWalletsService],
})
export class ScriptsModule {}
