import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  CreateJobInput,
  FilterGetAllInput,
  UpdateJobInput,
} from '../dto/job.dto';
import { LoggerService } from '../../../core/logger/logger.service';
import { tr } from '@faker-js/faker/.';

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async createJob(user_id: string, data: CreateJobInput) {
    this.logger.log('Creating new job entry...');

    const company = await this.prisma.company.findFirst({
      where: { user_id: user_id },
    });

    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        const job = await prisma.job.create({
          data: {
            title: data.title,
            description: data.description,
            salary_start: data.salary_start,
            salary_end: data.salary_end,
            start_date: data.start_date,
            end_date: data.end_date,
            company: {
              connect: { id: company.id },
            },
          },
        });

        this.logger.log(`Job created with ID: ${job.id}`);
        return job;
      } catch (error) {
        this.logger.error('Error creating job', error.stack);
        throw new BadRequestException('Error creating job');
      }
    });

    return transaction;
  }

  async updateJob(user_id: string, jobId: string, data: UpdateJobInput) {
    this.logger.log(`Updating job with ID: ${jobId}`);

    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
        company: {
          user_id: { equals: user_id },
        },
      },
    });
    
    if (!job) {
      this.logger.warn(`Job with ID: ${jobId} not found`);
      throw new NotFoundException('Job not found');
    }

    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data,
        });

        this.logger.log(`Job with ID: ${jobId} updated successfully`);
        return updatedJob;
      } catch (error) {
        this.logger.error('Error updating job', error.stack);
        throw new BadRequestException('Error updating job');
      }
    });

    return transaction;
  }

  async deleteJob(user_id: string, jobId: string) {
    this.logger.log(`Deleting job with ID: ${jobId}`);

    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
        company: {
          user_id: { equals: user_id },
        },
      },
    });
    if (!job) {
      this.logger.warn(`Job with ID: ${jobId} not found`);
      throw new NotFoundException('Job not found');
    }

    // Start transaction
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        await prisma.job.delete({ where: { id: jobId } });

        this.logger.log(`Job with ID: ${jobId} deleted successfully`);
        return true;
      } catch (error) {
        this.logger.error('Error deleting job', error.stack);
        throw new BadRequestException('Error deleting job');
      }
    });

    return transaction;
  }

  async getAllJobs(filters: FilterGetAllInput) {
    this.logger.log('Fetching all jobs with filters...');

    const where = {};

    if (filters.title) {
      where['title'] = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.salary_start) {
      where['salary_start'] = { gte: filters.salary_start };
    }

    if (filters.salary_end) {
      where['salary_end'] = { lte: filters.salary_end };
    }

    if (filters.start_date) {
      where['start_date'] = { gte: filters.start_date };
    }

    if (filters.end_date) {
      where['end_date'] = { lte: filters.end_date };
    }

    try {
      const jobs = await this.prisma.job.findMany({
        where: where,
        include: {
          company: true, // You can include the company if necessary
        },
      });
      return jobs;
    } catch (error) {
      this.logger.error('Error fetching jobs', error.stack);
      throw new BadRequestException('Error fetching jobs');
    }
  }

  async getJobById(jobId: string) {
    this.logger.log(`Fetching job with ID: ${jobId}`);

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      this.logger.warn(`Job with ID: ${jobId} not found`);
      throw new NotFoundException('Job not found');
    }

    this.logger.log(`Job with ID: ${jobId} fetched successfully`);
    return job;
  }
}
