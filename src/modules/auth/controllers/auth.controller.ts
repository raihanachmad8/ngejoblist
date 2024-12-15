import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { Public, GetCurrentUser } from '../../../common/decorators';
import { AuthService } from '../services/auth.service';
import { SigninDto, SigninInput, SignupCompanyDto, SignupCompanyInput, SignupDto } from '../dto/auth.dto';
import { RtGuard } from '../guards/rt.guard';
import { AtGuard } from '../guards/at.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8, maxLength: 32 },
        password_confirmation: { type: 'string', minLength: 8, maxLength: 32 },
      },
      example: {  
        name: 'User Name',  
        email: 'user@example.com',
        password: 'Password@1234',
        password_confirmation: 'Password@1234',
      },
      required: ['name', 'email', 'password', 'password_confirmation'],
    },
  })
  async register(@Body(new ZodValidationPipe(SignupDto)) dto: SigninInput) {
    const result = await this.authService.signup(dto);
    return {
      ...result,
      message: 'User registered successfully',
    };
  }

  @Public()
  @Post('company/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Company registration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Company successfully registered' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 2, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8, maxLength: 32 },
        password_confirmation: { type: 'string', minLength: 8, maxLength: 32 },
        about: { type: 'string', minLength: 10, maxLength: 1000 },
        phone: { type: 'string', minLength: 10, maxLength: 15 },
        address: { type: 'string', minLength: 5, maxLength: 255 },
        website: { type: 'string', format: 'url', minLength: 5 },
        employees: { type: 'number', minimum: 1, maximum: 500000},
      },
      example: {  
        name: 'Company Name',  
        email: 'company@example.com',
        password: 'Password@456',
        password_confirmation: 'Password@456',
        about: 'Company description',
        phone: '081234567890',
        address: 'Company address',
        website: 'https://company.com',
        employees: 100,
      },
      required: ['name', 'email', 'password', 'password_confirmation', 'about', 'phone', 'address', 'website', 'employees'],
    },
  })
  async registerCompany(@Body(new ZodValidationPipe(SignupCompanyDto)) dto: SignupCompanyInput) {
    const result = await this.authService.signupCompany(dto);
    return {
      ...result,
      message: 'Company registered successfully',
    };
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
      example: {  
        email: 'user@example.com',
        password: 'Password@1234',
      },
      required: ['email', 'password'],
    },
  })
  async login(@Body(new ZodValidationPipe(SigninDto)) dto: SigninInput) {
    const result = await this.authService.signin(dto);
    return {
      ...result,
      message: 'Login successful',
    };
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
  @ApiBearerAuth('RefreshToken')
  async refreshTokens(
    @GetCurrentUser('sub') user_id: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    const result = await this.authService.refreshTokens(user_id, refreshToken);
    return {
      ...result,
      message: 'Tokens refreshed successfully',
    };
  }

  @UseGuards(AtGuard)
  @Get('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @ApiBearerAuth('AccessToken')
  async getCurrentUser(@GetCurrentUser() user: any) {
    const result = await this.authService.getCurrentUser(user.sub);
    return {
      ...result,
      message: 'User details retrieved successfully',
    };
  }

  @UseGuards(AtGuard)
  @Delete('signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged out' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @ApiBearerAuth('AccessToken')
  async signout(@GetCurrentUser() payload: any) {
    await this.authService.signout(payload.sub, payload.accessToken);
    return {
      message: 'User logged out successfully',
    };
  }
}
