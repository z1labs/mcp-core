import { Module } from '@nestjs/common';

import { KmsModule } from 'modules/kms/kms.module';
import { UserService } from './user.service';

@Module({
  imports: [KmsModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
