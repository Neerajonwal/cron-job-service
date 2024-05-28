import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, Res, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { CronJobService } from '../services/cron-job-service';
import { CreateCronJobDto } from '../dtos/create-cron-job.dto';

@Controller('cron-jobs')
export class CronJobController {
  constructor(private readonly cronJobService: CronJobService) {}

  @Post()
  async create(@Body() createCronJobDto: CreateCronJobDto, @Res() res: Response) {
    try {
      const cronJob = await this.cronJobService.create(createCronJobDto);
      return res.status(HttpStatus.CREATED).json(cronJob);
    } catch (error) {
      throw new HttpException('Failed to create cron job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const cronJobs = await this.cronJobService.findAll();
      return res.status(HttpStatus.OK).json(cronJobs);
    } catch (error) {
      throw new HttpException('Failed to retrieve cron jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('webhooks')
  async getAllWebhooks(@Res() res: Response) {
    try {
      const webhooks = await this.cronJobService.getAllWebhooks();
      return res.status(HttpStatus.OK).json(webhooks);
    } catch (error) {
      throw new HttpException('Failed to retrieve webhooks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const cronJob = await this.cronJobService.findById(id);
      if (!cronJob) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Cron job not found' });
      }
      return res.status(HttpStatus.OK).json(cronJob);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid ID format' });
      }
      throw new HttpException('Failed to retrieve cron job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCronJobDto: any, @Res() res: Response) {
    try {
      const updatedCronJob = await this.cronJobService.update(id, updateCronJobDto);
      if (!updatedCronJob) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Cron job not found' });
      }
      return res.status(HttpStatus.OK).json(updatedCronJob);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid ID format' });
      }
      throw new HttpException('Failed to update cron job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.cronJobService.delete(id);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Cron job not found' });
      }
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid ID format' });
      }
      throw new HttpException('Failed to delete cron job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() data: any, @Res() res: Response) {
    try {
      const webhook = await this.cronJobService.handleWebhook(data);
      return res.status(HttpStatus.CREATED).json(webhook);
    } catch (error) {
      throw new HttpException('Failed to handle webhook', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
