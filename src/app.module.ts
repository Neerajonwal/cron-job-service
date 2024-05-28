// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CronJobController } from './controllers/cron-job-controller';
import { CronJobService } from './services/cron-job-service';
import { CronJob, CronJobSchema } from './schemas/cron-job-schema';
import { Webhook, WebhookSchema } from './schemas/webhook.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes the ConfigModule globally available
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: CronJob.name, schema: CronJobSchema },
      { name: Webhook.name, schema: WebhookSchema },
    ]),
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  controllers: [CronJobController],
  providers: [CronJobService],
})
export class AppModule {}
