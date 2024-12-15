// src/modules/user-management/dtos/profiles.dto.ts
import { z } from 'zod';

// Update Profile DTO
export const UpdateProfileDto = z.object({
  name: z
    .string()
    .min(2, 'Name minimal 2 characters')
    .max(255, 'Name maximal 255 characters')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  bio: z.string().max(255, 'Bio maximal 255 characters').optional(),
  portfolio: z.string().url('URL portfolio invalid').optional(),
  cv: z.string().url('URL CV invalid').optional(),
});

// File Validation DTO
export const FileValidationDto = z.object({
  fieldname: z.string(),
  originalname: z.string().regex(/\.(jpg|jpeg|png)$/i, { message: 'File must be a JPG, JPEG, or PNG' }),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer, { message: 'Buffer must be an instance of Buffer' }),
  size: z.number().max(5 * 1024 * 1024, { message: 'File size must be less than 5MB' }), // 5MB
  stream: z.any().optional(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
});

// Upload Profile Photo DTO
export const UploadProfilePhotoDto = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string().regex(/\.(jpg|jpeg|png)$/i, { message: 'File must be a JPG, JPEG, or PNG' }),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.instanceof(Buffer, { message: 'Buffer must be an instance of Buffer' }),
    size: z.number().max(5 * 1024 * 1024, { message: 'File size must be less than 5MB' }), // 5MB
    stream: z.any().optional(),
    destination: z.string().optional(),
    filename: z.string().optional(),
    path: z.string().optional(),
  }),
});

// Update Password DTO
export const UpdatePasswordDto = z
  .object({
    currentPassword: z
    .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password can be at most 32 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()]/, 'Password must contain at least one special character'),
    
    newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password can be at most 32 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()]/, 'Password must contain at least one special character'),
    confirmNewPassword: z
    .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password can be at most 32 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()]/, 'Password must contain at least one special character'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New password and confirm new password must be the same',
    path: ['confirmNewPassword'],
  });

// Types
export type UpdateProfileInput = z.infer<typeof UpdateProfileDto>;
export type UploadProfilePhotoInput = z.infer<typeof UploadProfilePhotoDto>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordDto>;