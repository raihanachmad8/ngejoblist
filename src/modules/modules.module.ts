import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './user-management/profiles.module';
import { JobModule } from './job/job.module';

@Module({
  imports: [AuthModule, ProfileModule, JobModule]
})
export class ModulesModule {}
