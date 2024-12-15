import {
  Controller,
  Patch,
  Put,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AtGuard } from '../../auth/guards/at.guard';
import { GetCurrentUser } from '../../../common/decorators';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ProfilesService } from '../services/profiles.service';
import { UpdateProfileDto, UpdatePasswordDto, FileValidationDto, UpdatePasswordInput, UpdateProfileInput } from '../dto/profiles.dto';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(AtGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // Update profile
  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2, maxLength: 50 },
        portfolio: { type: 'string', format: 'uri' },
        cv: { type: 'string', format: 'uri' },
      },
      example: {
        name: 'User Name',  
        portfolio: 'https://example.com',
        cv: 'https://example.com',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Failed to update profile' })
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @GetCurrentUser() user: User,
    @Body(new ZodValidationPipe(UpdateProfileDto)) updateProfileInput: UpdateProfileInput,
  ) {
    const updatedProfile = await this.profilesService.updateProfile(user['sub'], updateProfileInput);
    return { message: 'Profile updated successfully', ...updatedProfile };
  }

  // Upload profile photo
  @Put('photo')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @GetCurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File, // Directly accessing file
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const validatedFile = FileValidationDto.safeParse(file);

    if (!validatedFile.success) {
      throw new BadRequestException(validatedFile.error.errors);
    }

    const updatedPhoto = await this.profilesService.uploadProfilePhoto(user['sub'], file);
    return { message: 'Profile photo uploaded successfully', ...updatedPhoto };
  }

  // Delete profile photo
  @Delete('photo')
  @ApiOperation({ summary: 'Delete profile photo' })
  @ApiResponse({ status: 200, description: 'Profile photo deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete profile photo' })
  @HttpCode(HttpStatus.OK)
  async deleteProfilePhoto(@GetCurrentUser() user: User) {
    const deletedPhoto = await this.profilesService.deleteProfilePhoto(user['sub']);
    return { message: 'Profile photo deleted successfully', ...deletedPhoto };
  }

  // Change password
  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string', minLength: 8 },
        newPassword: { type: 'string', minLength: 8 },
        confirmNewPassword: { type: 'string' },
      },
      example: {
        currentPassword: 'Password@1234',
        newPassword: 'NewPassword@1234',
        confirmNewPassword: 'NewPassword@1234',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Failed to update password' })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetCurrentUser() user: User,
    @Body(new ZodValidationPipe(UpdatePasswordDto)) updatePasswordInput: UpdatePasswordInput,
  ) {
    const updatedPassword = await this.profilesService.updatePassword(user['sub'], updatePasswordInput);
    return { message: 'Password updated successfully', data: updatedPassword };
  }
}
