// src/modules/user-management/profiles/profiles.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdatePasswordInput, UpdateProfileInput } from '../dto/profiles.dto';
import { PrismaService } from '../../../core/database/prisma.service';
import { CloudinaryService } from '../../../core/cloudinary/cloudinary.service';
import { LoggerService } from '../../../core/logger/logger.service';
import { CryptoUtil } from '../../../common/utils';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private logger: LoggerService,
    private cripto: CryptoUtil,
  ) {}

  // Update Profile with Transaction
  async updateProfile(userId: string, dto: UpdateProfileInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(
        `User with ID ${userId} not found during profile update`,
      );
      throw new NotFoundException('User not found');
    }

    // Begin transaction to ensure data consistency
    try {
      const transactionResult = await this.prisma.$transaction(
        async (prisma) => {
          // Update profile data
          return await prisma.user.update({
            where: { id: userId },
            data: {
              name: dto.name,
              portfolio: dto.portfolio,
              cv: dto.cv,
            },
            select: {
              id: true,
              name: true,
              profile: true,
              portfolio: true,
              cv: true,
            },
          });
        },
      );

      this.logger.log(
        `Successfully updated profile for user with ID ${userId}`,
      );
      return {
        user: transactionResult,
      }
    } catch (error) {
      this.logger.error(
        `Error updating profile for user with ID ${userId}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update profile');
    }
  }

  // Upload Profile Photo with Transaction
  async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
    // Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(
        `User with ID ${userId} not found during profile photo upload`,
      );
      throw new NotFoundException('User not found');
    }

    // Validate file
    if (!file) {
      this.logger.error(
        `No file provided for profile photo upload for user with ID ${userId}`,
      );
      throw new BadRequestException('File is required');
    }

    try {
      // Begin transaction for uploading photo and updating user profile
      const transactionResult = await this.prisma.$transaction(
        async (prisma) => {
          // Upload to Cloudinary
          const uploadResult = await this.cloudinaryService.uploadImage(file);
          this.logger.log(
            `Successfully uploaded profile photo to Cloudinary for user with ID ${userId}`,
          );

          // Delete old profile photo if exists
          if (user.profile) {
            await this.cloudinaryService.deleteByUrl(user.profile);
            this.logger.log(
              `Deleted old profile photo for user with ID ${userId}`,
            );
          }

          // Update profile with new photo URL
          return await prisma.user.update({
            where: { id: userId },
            data: {
              profile: uploadResult.secure_url,
            },
            select: {
              id: true,
              profile: true,
            },
          });
        },
      );

      this.logger.log(
        `Successfully updated profile photo for user with ID ${userId}`,
      );
      return {
        user: transactionResult,
      }
    } catch (error) {
      this.logger.error(
        `Error uploading profile photo for user with ID ${userId}`,
        error.stack,
      );
      throw new BadRequestException('Failed to upload profile photo');
    }
  }

  // Delete Profile Photo with Transaction
  async deleteProfilePhoto(userId: string) {
    // Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(
        `User with ID ${userId} not found during profile photo deletion`,
      );
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      this.logger.error(`No profile photo found for user with ID ${userId}`);
      throw new NotFoundException('Profile photo not found');
    }

    try {
      // Begin transaction for deleting photo
      const transactionResult = await this.prisma.$transaction(
        async (prisma) => {
          // Delete photo from Cloudinary if exists
          if (user.profile) {
            await this.cloudinaryService.deleteByUrl(user.profile);
            this.logger.log(
              `Deleted profile photo from Cloudinary for user with ID ${userId}`,
            );
          }

          // Update profile to null
          return await prisma.user.update({
            where: { id: userId },
            data: {
              profile: null,
            },
            select: {
              id: true,
              profile: true,
            },
          });
        },
      );

      this.logger.log(
        `Successfully deleted profile photo for user with ID ${userId}`,
      );
      return {
        user: transactionResult,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting profile photo for user with ID ${userId}`,
        error.stack,
      );
      throw new BadRequestException('Failed to delete profile photo');
    }
  }

  // Update Password with Transaction
  async updatePassword(userId: string, dto: UpdatePasswordInput) {
    // Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(
        `User with ID ${userId} not found during password update`,
      );
      throw new NotFoundException('User not found');
    }

    // Check current password
    if (
      !(await this.cripto.comparePassword(
        dto.currentPassword,
        user.password_hash,
      ))
    ) {
      this.logger.error(
        `Incorrect current password for user with ID ${userId}`,
      );
      throw new BadRequestException('Current password is incorrect');
    }

    try {
      // Begin transaction for updating password
      const transactionResult = await this.prisma.$transaction(
        async (prisma) => {
          return await prisma.user.update({
            where: { id: userId },
            data: {
              password_hash: dto.newPassword,
            },
            select: {
              id: true,
            },
          });
        },
      );

      this.logger.log(
        `Successfully updated password for user with ID ${userId}`,
      );
      return transactionResult;
    } catch (error) {
      this.logger.error(
        `Error updating password for user with ID ${userId}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update password');
    }
  }
}
