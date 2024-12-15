import { z } from 'zod';

export const SignupDto = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name can be at most 50 characters')
      .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters'),

    email: z
      .string()
      .email('Invalid email format')
      .min(5, 'Email is too short')
      .max(100, 'Email is too long'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password can be at most 32 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()]/, 'Password must contain at least one special character'),

    password_confirmation: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password can be at most 32 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()]/, 'Password must contain at least one special character'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Password and password confirmation must match',
    path: ['password_confirmation'],
  });

export const SignupCompanyDto = z.intersection(SignupDto, z.object({
  about: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description can be at most 1000 characters'),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number can be at most 15 characters')
    .regex(/^[0-9]*$/, 'Phone number can only contain numbers'),

  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address can be at most 255 characters'),

  website: z
    .string()
    .url('Invalid URL format')
    .min(5, 'URL is too short')
    .max(255, 'URL is too long'),

  employees: z
    .number()
    .min(1, 'The number of employees must be at least 1')
    .max(500000, 'The number of employees can be at most 500000'),
}));

export const SigninDto = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email is too short'),

  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof SignupDto>;
export type SignupCompanyInput = z.infer<typeof SignupCompanyDto>;
export type SigninInput = z.infer<typeof SigninDto>;
