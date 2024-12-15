import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      // Parsing dan validasi value menggunakan Zod schema
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      // Jika Zod melempar error, kita tangkap dan format untuk memberikan detail
      if (error.errors) {
        const validationErrors = error.errors.map((err: any) => ({
          message: err.message,  // Pesan error dari Zod
          path: err.path.join('.'),  // Path ke field yang gagal
        }));

        // Membuang exception dengan detail error yang lebih jelas
        throw new BadRequestException({
          message: 'Validation failed',
          errors: validationErrors,  // Menyertakan error yang sudah diformat
        });
      }
      
      // Jika error bukan dari Zod, lempar ulang error
      throw error;
    }
  }
}
