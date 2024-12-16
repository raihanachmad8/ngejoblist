import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { JobService } from '../services/job.service';
import {
  CreateJobDto,
  UpdateJobDto,
  FilterGetAllDto,
  CreateJobInput,
  UpdateJobInput,
  FilterGetAllInput,
} from '../dto/job.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AtGuard } from '../../../modules/auth/guards/at.guard';
import { GetCurrentUser } from '../../../common/decorators';

@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job successfully created',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string', minLength: 1 },
        salary_start: { type: 'number', minimum: 0 },
        salary_end: { type: 'number', minimum: 0 },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
      },
      example: {
        title: 'Software Engineer',
        description: 'Develop and maintain software applications',
        salary_start: 5000,
        salary_end: 10000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      },
      required: [
        'title',
        'description',
        'salary_start',
        'salary_end',
        'start_date',
        'end_date',
      ],
    },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.COMPANY)
  @UseGuards(AtGuard)
  async createJob(
    @GetCurrentUser() user: any,
    @Body(new ZodValidationPipe(CreateJobDto)) dto: CreateJobInput,
  ) {
    const result = await this.jobService.createJob(user['sub'], dto); // Replace with actual company ID
    return {
      ...result,
      message: 'Job created successfully',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all jobs retrieved successfully',
  })
  async getAllJobs(
    @Query(new ZodValidationPipe(FilterGetAllDto)) filters: FilterGetAllInput,
  ) {
    const jobs = await this.jobService.getAllJobs(filters);
    return {
      jobs,
      message: 'Jobs retrieved successfully',
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  async getJobById(@Param('id') jobId: string) {
    const job = await this.jobService.getJobById(jobId);
    return {
      job,
      message: 'Job retrieved successfully',
    };
  }


  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string', minLength: 1 },
        salary_start: { type: 'number', minimum: 0 },
        salary_end: { type: 'number', minimum: 0 },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
      },
      example: {
        title: 'Software Engineer',
        description: 'Develop and maintain software applications',
        salary_start: 5000,
        salary_end: 10000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.COMPANY)
  @UseGuards(AtGuard)
  async updateJob(
    @GetCurrentUser() user: any,
    @Param('id') jobId: string,
    @Body(new ZodValidationPipe(UpdateJobDto)) dto: UpdateJobInput,
  ) {
    const result = await this.jobService.updateJob(user['sub'], jobId, dto);
    return {
      ...result,
      message: 'Job updated successfully',
    };
  }


  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete job by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.COMPANY)
  @UseGuards(AtGuard)
  async deleteJob(
    @GetCurrentUser() user: any,
    @Param('id') jobId: string) {
    const result = await this.jobService.deleteJob(user['sub'], jobId);
    return {
      message: 'Job deleted successfully',
      data: result,
    };
  }
}
