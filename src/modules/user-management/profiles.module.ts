import { Module } from '@nestjs/common';
import { ProfilesController } from './controllers/profiles.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from '../../common/config/multer.config';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { ProfilesService } from './services/profiles.service';

@Module({
  imports: [
    MulterModule.register(multerConfig)
  ],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    CloudinaryService
  ]
})
export class ProfileModule {}
