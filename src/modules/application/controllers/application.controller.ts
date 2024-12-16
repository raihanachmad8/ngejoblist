// src/modules/application/controllers/application.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ApplicationService } from '../services/application.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  GetApplicationByIdDto,
  FilterApplicationsDto,
  CreateApplicationInput,
  UpdateApplicationInput,
  GetApplicationByIdInput,
  FilterApplicationsInput,
} from '../dto/application.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AtGuard } from '../../../modules/auth/guards/at.guard';
import { GetCurrentUser } from '../../../common/decorators';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Application successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'cuid' },
        job_id: { type: 'string', format: 'cuid' },
        user_id: { type: 'string', format: 'cuid' },
        status: { type: 'string', enum: ['APPLIED'] },
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        job_id: { type: 'string', format: 'cuid' },
        user_id: { type: 'string', format: 'cuid' },
      },
      required: ['job_id', 'user_id'],
    },
  })
  @UseGuards(AtGuard)
  async createApplication(
    @GetCurrentUser() user: any,
    @Body(new ZodValidationPipe(CreateApplicationDto))
    dto: CreateApplicationInput,
  ) {
    const result = await this.applicationService.createApplication(dto);
    return {
      ...result,
      message: 'Application created successfully',
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'cuid' },
        job_id: { type: 'string', format: 'cuid' },
        user_id: { type: 'string', format: 'cuid' },
        status: { type: 'string', enum: ['APPLIED', 'REJECTED', 'ACCEPTED'] },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the application',
    type: 'string',
    format: 'cuid',
  })
  async getApplicationById(
    @Param(new ZodValidationPipe(GetApplicationByIdDto)) params: GetApplicationByIdInput,
  ) {
    const application = await this.applicationService.getApplicationById(
      params.id,
    );
    return {
      application,
      message: 'Application retrieved successfully',
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update application by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the application to update',
    type: 'string',
    format: 'cuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['APPLIED', 'REJECTED', 'ACCEPTED'] },
      },
      required: ['status'],
    },
  })
  @UseGuards(AtGuard)
  async updateApplication(
    @Param('id') applicationId: string,
    @Body(new ZodValidationPipe(UpdateApplicationDto))
    dto: UpdateApplicationInput,
  ) {
    const result = await this.applicationService.updateApplication(
      applicationId,
      dto,
    );
    return {
      ...result,
      message: 'Application updated successfully',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Filter applications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Applications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'cuid' },
              job_id: { type: 'string', format: 'cuid' },
              user_id: { type: 'string', format: 'cuid' },
              status: {
                type: 'string',
                enum: ['APPLIED', 'REJECTED', 'ACCEPTED'],
              },
            },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter applications by status',
    required: false,
    type: 'string',
    enum: ['APPLIED', 'REJECTED', 'ACCEPTED'],
  })
  async filterApplications(
    @Query(new ZodValidationPipe(FilterApplicationsDto))
    filters: FilterApplicationsInput,
  ) {
    const applications = await this.applicationService.filterApplications(
      filters,
    );
    return {
      applications,
      message: 'Applications retrieved successfully',
    };
  }
}
