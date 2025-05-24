import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SettingsModule } from 'modules/settings/settings.module';
import { SettingsService } from 'modules/settings/settings.service';
import { UserModule } from 'modules/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [SettingsModule],
      useFactory: async (settingsService: SettingsService) => {
        const secret = settingsService.getSettings().keys.jwtSecret;
        return {
          global: true,
          secret,
        };
      },
      inject: [SettingsService],
    }),
    forwardRef(() => UserModule),
  ],

  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
