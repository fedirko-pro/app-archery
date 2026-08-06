import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AchievementsModule } from './achievements/achievements.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BowCategoryModule } from './bow-category/bow-category.module';
import { ClubModule } from './club/club.module';
import { envSchema } from './config/env.zod';
import { resolveRootEnvPath } from './config/load-root-env';
import { DivisionModule } from './division/division.module';
import { EmailModule } from './email/email.module';
import { EquipmentModule } from './equipment/equipment.module';
import { FederationModule } from './federation/federation.module';
import { NotificationsModule } from './notification/notifications.module';
import { RuleModule } from './rule/rule.module';
import { TournamentModule } from './tournament/tournament.module';
import { TrainingModule } from './training/training.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveRootEnvPath(),
      validate: (config) => {
        const parsed = envSchema.safeParse(config);

        if (!parsed.success) {
          throw new Error(`Config validation error: ${parsed.error.message}`);
        }

        return parsed.data;
      },
    }),
    MikroOrmModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 100,
        },
      ],
    }),
    UserModule,
    AuthModule,
    EmailModule,
    TournamentModule,
    UploadModule,
    ClubModule,
    FederationModule,
    RuleModule,
    DivisionModule,
    BowCategoryModule,
    EquipmentModule,
    TrainingModule,
    AchievementsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
