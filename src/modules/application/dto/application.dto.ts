import { z } from 'zod';

export const UpdateApplicationDto = z.object({
  status: z.enum(['REJECTED', 'ACCEPTED']),
});

export const GetJobByIdDto = z.object({
  job_id: z.string().cuid(),
});

export const GetApplicationByIdDto = z.object({
  application_id: z.string().cuid(),
});

export const FilterApplicationsDto = z.object({
  name: z.string().optional(),
  job_id: z.string().cuid().optional(),
  status: z
    .enum(['APPLIED', 'REJECTED', 'PENDING', 'CANCELLED', 'ACCEPTED'])
    .optional(),
});

// Types
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationDto>;
export type GetApplicationByIdInput = z.infer<typeof GetApplicationByIdDto>;
export type GetJobByIdInput = z.infer<typeof GetJobByIdDto>;
export type FilterApplicationsInput = z.infer<typeof FilterApplicationsDto>;
