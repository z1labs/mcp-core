import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule { }
