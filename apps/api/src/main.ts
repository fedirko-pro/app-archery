import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL') as string;

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  // Serve static files from uploads directory
  // From dist/src/main.js: go up 4 levels to reach project root
  const projectRoot = join(__dirname, '..', '..', '..', '..');
  app.useStaticAssets(join(projectRoot, 'uploads'), {
    prefix: '/uploads/',
  });

  // Rule PDFs: files in uploads/rules/ served at /uploads/rules/
  app.useStaticAssets(join(projectRoot, 'uploads', 'rules'), {
    prefix: '/pdf/rules/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableCircularCheck: true,
    }),
  );

  const port = configService.get<number>('PORT') as number;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
