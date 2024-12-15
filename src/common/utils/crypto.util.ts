import * as bcrypt from 'bcrypt';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoUtil {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Hash a password using bcrypt.
   * @param password The plain text password.
   * @returns The hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds =
        this.configService.get<number>('auth.bcryptSaltRounds') || 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to hash password.',
        error.message,
      );
    }
  }

  /**
   * Compare a plain text password with a hashed password.
   * @param password The plain text password.
   * @param hashedPassword The hashed password.
   * @returns True if passwords match, otherwise false.
   */
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to compare passwords.',
        error.message,
      );
    }
  }

  /**
   * Generate a cryptographically secure random token.
   * @param length The length of the token in bytes (default: 32).
   * @returns The generated token as a hex string.
   */
  generateRandomToken(length = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate random token.',
        error.message,
      );
    }
  }
}
