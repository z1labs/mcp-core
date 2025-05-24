import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

import { AllExceptionsFilter } from 'common/interceptors/error.interceptor';
import { LoggingInterceptor } from 'common/interceptors/http.interceptor';
import { setupSwagger } from 'common/swagger/swagger.setup';
import { SettingsService } from 'modules/settings/settings.service';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule);

  const settings = app.get<SettingsService>(SettingsService).getSettings();

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  app.enableCors({
    origin: '*', // Allows requests from any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // HTTP methods allowed
    allowedHeaders: '*', // Allows all headers
  });

  setupSwagger(app, settings.app.swaggerPrefix);
  await app.listen(settings.app.appPort, async () => {
    const appUrl = settings.app.appUrl;
    const swaggerUrl = `${settings.app.appUrl}/${settings.app.swaggerPrefix}`;
    Logger.log(`Application is running on: ${appUrl}`);
    Logger.log(`Swagger is running on: ${swaggerUrl}`);
  });

}
bootstrap();
