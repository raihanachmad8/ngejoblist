import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/database/prisma.service';
import { SigninInput, SignupCompanyInput, SignupInput } from '../dto/auth.dto';
import { Role } from '@prisma/client';
import { CryptoUtil } from '../../../common/utils';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '../../../core/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cryptoUtil: CryptoUtil,
    private readonly logger: LoggerService,
  ) {}

  private async generateAccessToken(
    userId: string,
    role: Role,
    email: string,
  ): Promise<string> {
    return this.jwtService.sign(
      { sub: userId, role, email },
      {
        secret: this.configService.get<string>('auth.jwt.accessSecret'),
        expiresIn: this.configService.get<string>('auth.jwt.accessExpiration'),
      },
    );
  }

  private async generateRefreshToken(
    userId: string,
    email: string,
  ): Promise<string> {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('auth.jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('auth.jwt.refreshExpiration'),
      },
    );
  }

  async signup(dto: SignupInput) {
    const { name, email, password } = dto;
    this.logger.log(`Signup attempt for email: ${email}`);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email, name }],
      },
    });
    if (existingUser) {
      if (existingUser.email === email) {
        this.logger.warn(`Signup failed - email already registered: ${email}`);
        throw new ConflictException('Email already registered');
      }

      if (existingUser.name === name) {
        this.logger.warn(`Signup failed - name already registered: ${name}`);
        throw new ConflictException('Name already registered');
      }
    }

    const hashedPassword = await this.cryptoUtil.hashPassword(password);

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            email,
            name,
            role: Role.JOBSEEKER,
            password_hash: hashedPassword,
          },
        });

        const token = {
          access_token: await this.generateAccessToken(
            user.id,
            user.role,
            user.email,
          ),
          refresh_token: await this.generateRefreshToken(user.id, user.email),
        };

        await prisma.personalToken.create({
          data: {
            user_id: user.id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
          },
        });

        return { user, token };
      });

      this.logger.log(`Signup successful for email: ${email}`);
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        token: result.token,
      };
    } catch (error) {
      this.logger.error(`Signup failed for email: ${email}`, error.stack);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async signupCompany(dto: SignupCompanyInput) {
    const { name, email, password, about, address, employees, phone, website } =
      dto;

    this.logger.log(`Signup company attempt for email: ${email}`);

    const existingUser = await this.prisma.company.findFirst({
      where: {
        OR: [{ user: { email } }, { name }],
      },
      include: { user: true },
    });

    if (existingUser) {
      if (existingUser.user.email === email) {
        this.logger.warn(
          `Signup company failed - email already registered: ${email}`,
        );
        throw new ConflictException('Email already registered');
      }

      if (existingUser.user.name === name) {
        this.logger.warn(
          `Signup company failed - company name already registered: ${name}`,
        );
        throw new ConflictException('Company name already registered');
      }
    }

    const hashedPassword = await this.cryptoUtil.hashPassword(password);

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const company = await prisma.company.create({
          data: {
            name,
            about,
            address,
            employees,
            phone,
            website,
            user: {
              create: {
                email,
                name,
                role: Role.COMPANY,
                password_hash: hashedPassword,
              },
            },
          },
          include: { user: true },
        });

        const token = {
          access_token: await this.generateAccessToken(
            company.user.id,
            company.user.role,
            company.user.email,

          ),
          refresh_token: await this.generateRefreshToken(company.user.id, company.user.email),
        };

        await prisma.personalToken.create({
          data: {
            user_id: company.user.id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
          },
        });

        return { company, token };
      });

      this.logger.log(`Signup company successful for email: ${email}`);
      return {
        company: {
          id: result.company.id,
          name: result.company.name,
          about: result.company.about,
          address: result.company.address,
          employees: result.company.employees,
          phone: result.company.phone,
          website: result.company.website,
          user: {
            id: result.company.user.id,
            email: result.company.user.email,
            name: result.company.user.name,
            role: result.company.user.role,
          },
        },
        token: result.token,
      };
    } catch (error) {
      this.logger.error(
        `Signup company failed for email: ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create company');
    }
  }

  async signin(dto: SigninInput) {
    const { email, password } = dto;
    this.logger.log(`Signin attempt for email: ${email}`);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`Signin failed - user not found: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await this.cryptoUtil.comparePassword(
      password,
      user.password_hash,
    );
    if (!passwordMatch) {
      this.logger.warn(`Signin failed - invalid password for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = {
      access_token: await this.generateAccessToken(
        user.id,
        user.role,
        user.email,
      ),
      refresh_token: await this.generateRefreshToken(user.id, user.email),
    };

    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.personalToken.create({
          data: {
            user_id: user.id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
          },
        });
      });

      this.logger.log(`Signin successful for email: ${email}`);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      this.logger.error(
        `Signin failed during token creation for email: ${email}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create token');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredToken() {
    this.logger.log('Running scheduled task: deleteExpiredToken');
    try {
      const expiredTokens = await this.prisma.personalToken.findMany({
        where: {
          created_at: { lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
        },
      });

      await Promise.all(
        expiredTokens.map((token) =>
          this.prisma.personalToken.delete({ where: { id: token.id } }),
        ),
      );

      this.logger.log('Expired tokens successfully deleted');
    } catch (error) {
      this.logger.error('Failed to delete expired tokens', error.stack);
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    this.logger.log(`Attempting to refresh token for user ID: ${userId}`);

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const token = await prisma.personalToken.findUnique({
          where: {
            user_id: userId,
            refresh_token: refreshToken,
          },
          include: { User: true },
        });

        if (!token) {
          this.logger.warn(
            `Refresh token not found or invalid for user ID: ${userId}`,
          );
          throw new UnauthorizedException('Invalid credentials');
        }

        const newAccessToken = await this.generateAccessToken(
          token.User.id,
          token.User.role,
          token.User.email,
        );

        await prisma.personalToken.update({
          where: { id: token.id },
          data: { access_token: newAccessToken },
        });

        this.logger.log(`Tokens refreshed successfully for user ID: ${userId}`);
        return { access_token: newAccessToken, refresh_token: refreshToken };
      });

      return { token: result };
    } catch (error) {
      this.logger.error(
        `Failed to refresh token for user ID: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }

  async getCurrentUser(userId: string) {
    this.logger.log(`Fetching current user for user ID: ${userId}`);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User not found for user ID: ${userId}`);
      throw new UnauthorizedException('Access denied');
    }

    this.logger.log(`Current user fetched successfully for user ID: ${userId}`);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async signout(userId: string, accessToken: string) {
    this.logger.log(`Attempting signout for user ID: ${userId}`);

    try {
      await this.prisma.$transaction(async (prisma) => {
        const token = await prisma.personalToken.findUnique({
          where: {
            user_id: userId,
            access_token: accessToken,
          },
        });

        if (!token) {
          this.logger.warn(
            `Signout failed - token not found for user ID: ${userId}`,
          );
          throw new UnauthorizedException('Invalid credentials');
        }

        await prisma.personalToken.delete({ where: { id: token.id } });
      });

      this.logger.log(`Signout successful for user ID: ${userId}`);
      return { message: 'User logged out successfully' };
    } catch (error) {
      this.logger.error(`Signout failed for user ID: ${userId}`, error.stack);
      throw new InternalServerErrorException('Failed to sign out');
    }
  }
}
