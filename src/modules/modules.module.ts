import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './user-management/profiles.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [AuthModule, ProfileModule, JobModule, ApplicationModule]
})
export class ModulesModule {}
