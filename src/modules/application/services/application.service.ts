import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  UpdateApplicationInput,
  FilterApplicationsInput,
} from '../dto/application.dto';
import { LoggerService } from '../../../core/logger/logger.service';
import { ApplicationStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Scheduled cron job to check for expired jobs and cancel applications.
   * This job runs every minute.
   */
  @Cron('0 * * * * *')
  async handleExpiredJobs() {
    this.logger.log('Checking for expired jobs...');

    const expiredJobs = await this.prisma.job.findMany({
      where: { end_date: { lte: new Date() } },
    });

    if (expiredJobs.length === 0) {
      this.logger.log('No expired jobs found');
      return;
    }

    this.logger.log('Expired jobs found. Cancelling applications...');

    await Promise.all(
      expiredJobs.map(async (job) => {
        await this.prisma.application.updateMany({
          where: { job_id: job.id },
          data: { status: ApplicationStatus.CANCELLED },
        });
      }),
    );

    this.logger.log('Applications cancelled successfully 🚀');
  }

  /**
   * Creates a new application entry.
   * @param user_id - The ID of the user applying.
   * @param job_id - The ID of the job being applied for.
   * @returns The created application.
   * @throws NotFoundException if the job does not exist or has expired.
   * @throws BadRequestException if there is an error creating the application.
   */
  async createApplication(user_id: string, job_id: string) {
    this.logger.log('Creating new application entry...');

    const job = await this.prisma.job.findFirst({
      where: { id: job_id, end_date: { gte: new Date() } },
    });

    if (!job) {
      this.logger.warn(`Job with ID: ${job_id} not found or has expired`);
      throw new NotFoundException('Job not found or has expired');
    }

    try {
      const application = await this.prisma.application.create({
        data: {
          job_id,
          user_id,
          status: ApplicationStatus.PENDING,
        },
      });

      this.logger.log(`Application created with ID: ${application.id}`);
      return application;
    } catch (error) {
      this.logger.error('Error creating application', error.stack);
      throw new BadRequestException('Error creating application');
    }
  }

  /**
   * Updates an existing application.
   * @param application_id - The ID of the application to update.
   * @param data - The data to update the application with.
   * @returns The updated application.
   * @throws NotFoundException if the application does not exist.
   * @throws BadRequestException if there is an error updating the application.
   */
  async updateApplication(
    application_id: string,
    data: UpdateApplicationInput,
  ) {
    this.logger.log(`Updating application with ID: ${application_id}`);

    const application = await this.prisma.application.findFirst({
      where: { id: application_id },
    });

    if (!application) {
      this.logger.warn(`Application with ID: ${application_id} not found`);
      throw new NotFoundException('Application not found');
    }

    try {
      const updatedApplication = await this.prisma.application.update({
        where: { id: application_id },
        data,
      });

      this.logger.log(
        `Application with ID: ${application_id} updated successfully`,
      );
      return updatedApplication;
    } catch (error) {
      this.logger.error('Error updating application', error.stack);
      throw new BadRequestException('Error updating application');
    }
  }

  /**
   * Retrieves an application by its ID.
   * @param application_id - The ID of the application to retrieve.
   * @returns The application details.
   * @throws NotFoundException if the application does not exist.
   */
  async getApplicationById(application_id: string) {
    this.logger.log(`Fetching application with ID: ${application_id}`);

    const application = await this.prisma.application.findUnique({
      where: { id: application_id },
    });

    if (!application) {
      this.logger.warn(`Application with ID: ${application_id} not found`);
      throw new NotFoundException('Application not found');
    }

    this.logger.log(
 `Application with ID: ${application_id} retrieved successfully`,
    );
    return application;
  }

  /**
   * Filters applications based on provided filters.
   * @param filters - The filters to apply when fetching applications.
   * @returns A list of applications that match the filters.
   * @throws BadRequestException if there is an error fetching applications.
   */
  async filterApplications(filters: FilterApplicationsInput) {
    this.logger.log('Fetching applications with filters...');

    const where: any = {};

    if (filters.job_id) {
      where.job_id = filters.job_id;
    }

    if (filters.name) {
      where.user = {
        name: {
          contains: filters.name,
        },
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    try {
      const applications = await this.prisma.application.findMany({
        where,
      });
      return applications;
    } catch (error) {
      this.logger.error('Error fetching applications', error.stack);
      throw new BadRequestException('Error fetching applications');
    }
  }

  /**
   * Cancels an application by updating its status.
   * @param user_id - The ID of the user cancelling the application.
   * @param application_id - The ID of the application to cancel.
   * @returns A message indicating the application was cancelled successfully.
   * @throws NotFoundException if the application does not exist or does not belong to the user.
   * @throws BadRequestException if there is an error cancelling the application.
   */
  async cancelApplication(user_id: string, application_id: string) {
    this.logger.log(`Cancelling application with ID: ${application_id}`);

    const application = await this.prisma.application.findFirst({
      where: { id: application_id, user_id },
    });

    if (!application) {
      this.logger.warn(`Application with ID: ${application_id} not found`);
      throw new NotFoundException('Application not found');
    }

    try {
      await this.prisma.application.update({
        where: { id: application_id },
        data: { status: ApplicationStatus.CANCELLED },
      });

      this.logger.log(
        `Application with ID: ${application_id} cancelled successfully`,
      );
      return { message: 'Application cancelled successfully' };
    } catch (error) {
      this.logger.error('Error cancelling application', error.stack);
      throw new BadRequestException('Error cancelling application');
    }
  }
}