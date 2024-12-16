import { z } from 'zod';

// Create Job DTO
export const CreateJobDto = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title can be at most 255 characters'),
    description: z.string().min(1, 'Description is required'),
    salary_start: z.number().min(0, 'Salary start must be a positive number'),
    salary_end: z.number().min(0, 'Salary end must be a positive number'),
    start_date: z.union([z.string(), z.date()]).optional(),
    end_date: z.union([z.string(), z.date()]).optional(),
  })
  .refine((data) => {
    // Salary validation
    if (data.salary_start >= data.salary_end) {
      throw new Error('Salary start must be less than salary end');
    }

    // Date conversion and validation
    if (data.start_date) {
      const startDate = new Date(data.start_date);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start_date format');
      }
      data.start_date = startDate; 
    }
    if (data.end_date) {
      const endDate = new Date(data.end_date);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end_date format');
      }
      data.end_date = endDate; 
    }

    return true; 
  })
  .refine((data) => {
    // Ensure start_date is before end_date
    if (data.start_date && data.end_date) {
      return data.start_date < data.end_date; 
    }
    return true; 
  }, {
    message: 'start_date must be before end_date',
  });

// Update Job DTO
export const UpdateJobDto = z
  .object({
    title: z
      .string()
      .max(255, 'Title can be at most 255 characters')
      .optional(),
    description: z.string().optional(),
    salary_start: z
      .number()
      .min(0, 'Salary start must be a positive number')
      .optional(),
    salary_end: z
      .number()
      .min(0, 'Salary end must be a positive number')
      .optional(),
    start_date: z.union([z.string(), z.date()]).optional(),
    end_date: z.union([z.string(), z.date()]).optional(),
  })
  .refine((data) => {
    // Salary validation
    if (data.salary_start !== undefined && data.salary_end !== undefined) {
      if (data.salary_start >= data.salary_end) {
        throw new Error('Salary start must be less than salary end');
      }
    }
    return true;
  })
  .refine((data) => {
    if (data.start_date) {
      const startDate = new Date(data.start_date);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start_date format');
      }
      data.start_date = startDate; 
    }
    if (data.end_date) {
      const endDate = new Date(data.end_date);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end_date format');
      }
      data.end_date = endDate; 
    }

    // Ensure start_date is before end_date
    if (data.start_date && data.end_date) {
      return data.start_date < data.end_date; 
    }
    return true; 
  }, {
    message: 'start_date must be before end_date',
  });

export const FilterGetAllDto = z.object({
  title: z.string().max(255, 'Title can be at most 255 characters').optional(),
  salary_start: z
    .number()
    .min(0, 'Salary start must be a positive number')
    .optional(),
  salary_end: z
    .number()
    .min(0, 'Salary end must be a positive number')
    .optional(),
  start_date: z.union([z.string(), z.date()]).optional(),
  end_date: z.union([z.string(), z.date()]).optional(),
});

// Types
export type CreateJobInput = z.infer<typeof CreateJobDto>;
export type UpdateJobInput = z.infer<typeof UpdateJobDto>;
export type FilterGetAllInput = z.infer<typeof FilterGetAllDto>;