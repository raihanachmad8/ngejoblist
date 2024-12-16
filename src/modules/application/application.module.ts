import { Module } from '@nestjs/common';
import { ApplicationService } from './services/application.service';
import { ApplicationController } from './controllers/application.controller';

@Module({
  providers: [ApplicationService],
  controllers: [ApplicationController]
})
export class ApplicationModule {}
