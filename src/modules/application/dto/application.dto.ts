import { z } from 'zod';

export const CreateApplicationDto = z.object({
  job_id: z.string().cuid(), 
  user_id: z.string().cuid(),
});

export const UpdateApplicationDto = z.object({
  status: z.enum(['APPLIED', 'REJECTED', 'ACCEPTED']),
});

export const GetApplicationByIdDto = z.object({
  id: z.string().cuid(), 
});

export const FilterApplicationsDto = z.object({
  job_id: z.string().cuid().optional(), 
  user_id: z.string().cuid().optional(),
  status: z.enum(['APPLIED', 'REJECTED', 'ACCEPTED']).optional(), 
});

// Types
export type CreateApplicationInput = z.infer<typeof CreateApplicationDto>;
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationDto>;
export type GetApplicationByIdInput = z.infer<typeof GetApplicationByIdDto>;
export type FilterApplicationsInput = z.infer<typeof FilterApplicationsDto>;