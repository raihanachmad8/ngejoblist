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
  UpdateApplicationDto,
  GetApplicationByIdDto,
  FilterApplicationsDto,
  UpdateApplicationInput,
  GetApplicationByIdInput,
  FilterApplicationsInput,
  GetJobByIdDto,
  GetJobByIdInput,
} from '../dto/application.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AtGuard } from '../../../modules/auth/guards/at.guard';
import { GetCurrentUser } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

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
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 409, description: 'Application already exists' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        job_id: { type: 'string', format: 'cuid' },
      },
      example: {
        job_id: 'cku5f9x6s0000l6qk6d2j1l8s',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.JOBSEEKER)
  @UseGuards(AtGuard)
  async createApplication(
    @GetCurrentUser() user: any,
    @Body(new ZodValidationPipe(GetJobByIdDto)) body: GetJobByIdInput,
  ) {
    const result = await this.applicationService.createApplication(
      user['sub'],
      body.job_id,
    );
    return {
      ...result,
      message: 'Application created successfully',
    };
  }

  @Get(':application_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiParam({
    name: 'application_id',
    description: 'ID of the application',
    type: 'string',
    format: 'cuid',
  })
  async getApplicationById(
    @Param(new ZodValidationPipe(GetApplicationByIdDto))
    params: GetApplicationByIdInput,
  ) {
    const application = await this.applicationService.getApplicationById(
      params.application_id,
    );
    return {
      application,
      message: 'Application retrieved successfully',
    };
  }

  @Put(':application_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update application by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Application not found' })  
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['REJECTED', 'ACCEPTED'] },
      },
      example: {
        status: 'ACCEPTED',
      },
    },
  })
  @ApiParam({
    name: 'application_id',
    description: 'ID of the application to update',
    type: 'string',
    format: 'cuid',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.COMPANY)
  @UseGuards(AtGuard)
  async updateApplication(
    @Param(new ZodValidationPipe(GetApplicationByIdDto))
    params: GetApplicationByIdInput,
    @Body(new ZodValidationPipe(UpdateApplicationDto))
    body: UpdateApplicationInput,
  ) {
    const result = await this.applicationService.updateApplication(
      params.application_id,
      body,
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
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiQuery({
    name: 'status',
    description: 'Filter applications by status',
    required: false,
    type: 'string',
    enum: ['REJECTED', 'ACCEPTED'],
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

  @Delete(':application_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel application by ID' })
  @ApiResponse({
    status: 200,
    description: 'Application cancelled successfully.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.JOBSEEKER)
  @UseGuards(AtGuard)
  async cancelApplication(
    @GetCurrentUser() user: any,
    @Param(new ZodValidationPipe(GetApplicationByIdDto))
    params: GetApplicationByIdInput,
  ) {
    const result = await this.applicationService.cancelApplication(
      user['sub'],
      params.application_id,
    );
    return {
      result,
      message: 'Application cancelled successfully',
    };
  }
}
