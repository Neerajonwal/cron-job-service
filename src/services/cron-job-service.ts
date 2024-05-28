import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronJob } from '../schemas/cron-job-schema';
import { Webhook } from '../schemas/webhook.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as cron from 'node-cron';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    @InjectModel(CronJob.name) private readonly cronJobModel: Model<CronJob>,
    @InjectModel(Webhook.name) private readonly webhookModel: Model<Webhook>,
    private readonly httpService: HttpService,
  ) {}

  async create(cronJobDto: any): Promise<CronJob> {
    try {
      const createdCronJob = new this.cronJobModel(cronJobDto);
      return await createdCronJob.save();
    } catch (error) {
      this.logger.error('Error creating cron job', error);
      throw new InternalServerErrorException('Failed to create cron job');
    }
  }

  async findAll(): Promise<CronJob[]> {
    try {
      return await this.cronJobModel.find().exec();
    } catch (error) {
      this.logger.error('Error finding cron jobs', error);
      throw new InternalServerErrorException('Failed to find cron jobs');
    }
  }

  async findById(id: string): Promise<CronJob> {
    try {
      return await this.cronJobModel.findById(id).exec();
    } catch (error) {
      this.logger.error(`Error finding cron job with id ${id}`, error);
      throw new InternalServerErrorException(`Failed to find cron job with id ${id}`);
    }
  }

  async update(id: string, cronJobDto: any): Promise<CronJob> {
    try {
      return await this.cronJobModel.findByIdAndUpdate(id, cronJobDto, { new: true }).exec();
    } catch (error) {
      this.logger.error(`Error updating cron job with id ${id}`, error);
      throw new InternalServerErrorException(`Failed to update cron job with id ${id}`);
    }
  }

  async delete(id: string): Promise<any> {
    try {
      return await this.cronJobModel.findByIdAndDelete(id).exec();
    } catch (error) {
      this.logger.error(`Error deleting cron job with id ${id}`, error);
      throw new InternalServerErrorException(`Failed to delete cron job with id ${id}`);
    }
  }

  async handleCronJobs() {
    try {
      const cronJobs = await this.findAll();
      for (const job of cronJobs) {
        if (new Date(job.startDate) <= new Date()) {
          this.scheduleJob(job);
        }
      }
    } catch (error) {
      this.logger.error('Error handling cron jobs', error);
    }
  }

  scheduleJob(job: CronJob) {
    try {
      const cronTime = job.schedule; // This should be a valid cron expression
      cron.schedule(cronTime, async () => {
        try {
          const response = await lastValueFrom(this.httpService.get(job.link));
          job.history.push({ timestamp: new Date(), response: response.data });
          await job.save();
        } catch (error) {
          this.logger.error(`Failed to execute job ${job.name}`, error);
        }
      });
    } catch (error) {
      this.logger.error(`Error scheduling job ${job.name}`, error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.handleCronJobs();
  }

  async handleWebhook(data: any) {
    try {
      const webhookData = {
        data,
        createdAt: new Date(),
      };
      const webhook = new this.webhookModel(webhookData);
      return await webhook.save();
    } catch (error) {
      this.logger.error('Error handling webhook', error);
      throw new InternalServerErrorException('Failed to handle webhook');
    }
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    try {
      return await this.webhookModel.find().exec();
    } catch (error) {
      this.logger.error('Error finding webhooks', error);
      throw new InternalServerErrorException('Failed to find webhooks');
    }
  }
}
