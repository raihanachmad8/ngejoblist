import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  CreateApplicationInput,
  UpdateApplicationInput,
  FilterApplicationsInput,
} from '../dto/application.dto';
import { LoggerService } from '../../../core/logger/logger.service';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async createApplication(data: CreateApplicationInput) {
    this.logger.log('Creating new application entry...');

    try {
      // const existingApplication = await this.prisma.application.findFirst({
      //   where: { id: data.job_id, user_id: data.user_id },
      // });

      // if (!existingApplication) {
      //   this.logger.warn('Application already exists');
      //   throw new BadRequestException('Application already exists');
      // }

      const application = await this.prisma.application.create({
        data: {
          job_id: data.job_id,
          user_id: data.user_id,
        },
      });

      this.logger.log(`Application created with ID: ${application.id}`);
      return application;
    } catch (error) {
      this.logger.error('Error creating application', error.stack);
      throw new BadRequestException('Error creating application');
    }
  }

  async updateApplication(id: string, data: UpdateApplicationInput) {
    this.logger.log(`Updating application with ID: ${id}`);

    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      this.logger.warn(`Application with ID: ${id} not found`);
      throw new NotFoundException('Application not found');
    }

    try {
      const updatedApplication = await this.prisma.application.update({
        where: { id },
        data,
      });

      this.logger.log(`Application with ID: ${id} updated successfully`);
      return updatedApplication;
    } catch (error) {
      this.logger.error('Error updating application', error.stack);
      throw new BadRequestException('Error updating application');
    }
  }

  async getApplicationById(id: string) {
    this.logger.log(`Fetching application with ID: ${id}`);

    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      this.logger.warn(`Application with ID: ${id} not found`);
      throw new NotFoundException('Application not found');
    }

    this.logger.log(`Application with ID: ${id} fetched successfully`);
    return application;
  }

  async filterApplications(filters: FilterApplicationsInput) {
    this.logger.log('Fetching applications with filters...');

    const where = {};

    if (filters.job_id) {
      where['job_id'] = filters.job_id;
    }

    if (filters.user_id) {
      where['user_id'] = filters.user_id;
    }

    if (filters.status) {
      where['status'] = filters.status;
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
}
