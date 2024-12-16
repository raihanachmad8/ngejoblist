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

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Creates a new job entry.
   * @param user_id - The ID of the user creating the job.
   * @param data - The data for the job to be created.
   * @returns A promise that resolves to the created job.
   * @throws BadRequestException if there is an error creating the job.
   */
  async createJob(user_id: string, data: CreateJobInput) {
    this.logger.log('Creating new job entry...');

    const company = await this.prisma.company.findFirst({
      where: { user_id: user_id },
    });

    try {
      const job = await this.prisma.$transaction(async (prisma) => {
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
      });

      return job;
    } catch (error) {
      this.logger.error('Error creating job', error.stack);
      throw new BadRequestException('Error creating job');
    }
  }

  /**
   * Updates an existing job entry.
   * @param user_id - The ID of the user updating the job.
   * @param jobId - The ID of the job to be updated.
   * @param data - The data to update the job with.
   * @returns A promise that resolves to the updated job.
   * @throws NotFoundException if the job is not found.
   * @throws BadRequestException if there is an error updating the job.
   */
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

    try {
      const updatedJob = await this.prisma.$transaction(async (prisma) => {
        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data,
        });

        this.logger.log(`Job with ID: ${jobId} updated successfully`);
        return updatedJob;
      });

      return updatedJob;
    } catch (error) {
      this.logger.error('Error updating job', error.stack);
      throw new BadRequestException('Error updating job');
    }
  }

  /**
   * Deletes a job entry.
   * @param user_id - The ID of the user deleting the job.
   * @param jobId - The ID of the job to be deleted.
   * @returns A promise that resolves to a boolean indicating success.
   * @throws NotFoundException if the job is not found.
   * @throws BadRequestException if there is an error deleting the job.
   */
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

    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.job.delete({ where: { id: jobId } });

        this.logger.log(`Job with ID: ${jobId} deleted successfully`);
        return true;
      });
    } catch (error) {
      this.logger.error('Error deleting job', error .stack);
      throw new BadRequestException('Error deleting job');
    }
  }

  /**
   * Retrieves all jobs with optional filters.
   * @param filters - The filters to apply when fetching jobs.
   * @returns A promise that resolves to an array of jobs.
   * @throws BadRequestException if there is an error fetching jobs.
   */
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

  /**
   * Retrieves a job by its ID.
   * @param jobId - The ID of the job to be fetched.
   * @returns A promise that resolves to the job.
   * @throws NotFoundException if the job is not found.
   */
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