import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.v2.config({
      cloud_name: this.configService.get<string>('storage.cloudinary.cloudName'),
      api_key: this.configService.get<string>('storage.cloudinary.apiKey'),
      api_secret: this.configService.get<string>('storage.cloudinary.apiSecret'),
      secure: true,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      ).end(file.buffer);
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'video',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      ).end(file.buffer);
    });
  }

  async deleteByUrl(url: string): Promise<any> {
    const publicId = url.split('/').pop();
    return cloudinary.v2.uploader.destroy(publicId);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.v2.uploader.destroy(publicId);
  }

  async deleteVideo(publicId: string): Promise<any> {
    return cloudinary.v2.uploader.destroy(publicId, { resource_type: 'video' });
  }
}