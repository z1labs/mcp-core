import { Module } from '@nestjs/common';

import { KmsService } from './kms.service';

@Module({
  imports: [],
  providers: [KmsService],
  exports: [KmsService],
})
export class KmsModule {}
