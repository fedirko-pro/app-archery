import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.set('trust proxy', 1);

  const frontendUrl = configService.get<string>('FRONTEND_URL') as string;

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());

  // User uploads (avatars, banners, attachments) live under apps/api/uploads.
  // From dist/src/main.js → apps/api.
  const apiRoot = join(__dirname, '..', '..');
  // Rule PDFs live at monorepo-root uploads/rules.
  const monorepoRoot = join(__dirname, '..', '..', '..', '..');

  app.useStaticAssets(join(monorepoRoot, 'uploads', 'rules'), {
    prefix: '/uploads/rules/',
  });
  // Legacy alias used by some rule download links
  app.useStaticAssets(join(monorepoRoot, 'uploads', 'rules'), {
    prefix: '/pdf/rules/',
  });
  app.useStaticAssets(join(apiRoot, 'uploads'), {
    prefix: '/uploads/',
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
