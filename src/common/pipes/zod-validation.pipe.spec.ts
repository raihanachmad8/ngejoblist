import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodValidationPipe } from './zod-validation.pipe';
import { z, ZodSchema } from 'zod';

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;

  beforeEach(async () => {
    const schema: ZodSchema<any> = z.object({
      name: z.string(),
    });

    pipe = new ZodValidationPipe(schema);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should validate input', () => {
    const value = { name: 'John' };
    const metadata: ArgumentMetadata = { type: 'body' };

    expect(pipe.transform(value, metadata)).toEqual(value);
  });

  it('should throw BadRequestException for invalid input', () => {
    const value = { name: 123 };
    const metadata: ArgumentMetadata = { type: 'body' };

    expect(() => pipe.transform(value, metadata)).toThrow(BadRequestException);
  });
});