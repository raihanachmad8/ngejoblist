import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { TransformResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { CryptoUtil } from '../src/common/utils';
import { Role } from '@prisma/client';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let crypto: CryptoUtil;
  let accessToken: string;
  let personalTokenId: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    crypto = app.get(CryptoUtil);

    // Setup ValidationPipe and Interceptor
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();
  });

  afterAll(async () => {
    // Cleanup database
    await prisma.personalToken.deleteMany({
      where: { id: { in: personalTokenId } },
    });
    await app.close();
  });

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(200);

    const personalToken = await prisma.personalToken.findFirst({
      where: { access_token: response.body.data.token.access_token },
    });

    personalTokenId.push(personalToken.id);
    return response.body.data.token;
  };

  describe('POST /auth/signup', () => {
    const userSignUpCredentials = {
      id: 'test-user-auth-signup-id',
      name: 'Test User Auth Signup',
      email: 'testuserauthsignup@example.com',
      password: 'P@ssw0rd!',
      password_confirmation: 'P@ssw0rd!',
    };

    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { email: userSignUpCredentials.email },
      });
    });

    it('should register a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userSignUpCredentials)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'User registered successfully',
      );
      expect(response.body.data.user).toHaveProperty(
        'email',
        userSignUpCredentials.email,
      );
    });

    it('should return conflict error if email already exists', async () => {
      await prisma.user.create({
        data: {
          id: userSignUpCredentials.id,
          name: userSignUpCredentials.name,
          email: userSignUpCredentials.email,
          password_hash: await crypto.hashPassword(
            userSignUpCredentials.password,
          ),
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userSignUpCredentials)
        .expect(409);

      expect(response.body).toHaveProperty(
        'message',
        'Email already registered',
      );
    });

    it('should return validation error for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...userSignUpCredentials, email: 'invalidemail' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error if passwords do not match', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          ...userSignUpCredentials,
          password_confirmation: 'DifferentPassword!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          ...userSignUpCredentials,
          password: 'weak',
          password_confirmation: 'weak',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/company/signup', () => {
    const companySignUpCredentials = {
      id: 'test-company-auth-signup-id',
      name: 'Company Name Auth',
      about: 'Company Description Auth',
      address: 'Company Address',
      phone: '081234567890',
      website: 'https://example-auth.com',
      employees: 10,
      email: 'companyauth@example.com',
      password: 'P@ssw0rd!',
    };

    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { email: companySignUpCredentials.email },
      });
    });

    it('should register a company successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companySignUpCredentials,
          password_confirmation: companySignUpCredentials.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Company registered successfully',
      );
      expect(response.body.data.company.user).toHaveProperty(
        'email',
        companySignUpCredentials.email,
      );
    });

    it('should return conflict error if company email already exists', async () => {
      await prisma.company.create({
        data: {
          id: companySignUpCredentials.id,
          name: companySignUpCredentials.name,
          about: companySignUpCredentials.about,
          address: companySignUpCredentials.address,
          phone: companySignUpCredentials.phone,
          website: companySignUpCredentials.website,
          employees: companySignUpCredentials.employees,
          user: {
            create: {
              id: companySignUpCredentials.id,
              name: companySignUpCredentials.name,
              email: companySignUpCredentials.email,
              password_hash: await crypto.hashPassword(
                companySignUpCredentials.password,
              ),
              role: Role.COMPANY,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companySignUpCredentials,
          password_confirmation: companySignUpCredentials.password,
        })
        .expect(409);

      expect(response.body).toHaveProperty(
        'message',
        'Email already registered',
      );
    });

    it('should return validation error for invalid company email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companySignUpCredentials,
          email: 'invalidemail',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error if company passwords do not match', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companySignUpCredentials,
          password_confirmation: 'DifferentPassword!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error for weak company password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companySignUpCredentials,
          password: 'weak',
          password_confirmation: 'weak',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/signin', () => {
    const userSigninCredentials = {
      name: 'Test User Auth Signin',
      email: 'testuserauthsignin@example.com',
      password: 'P@ssw0rd!',
    };

    const companySigninCredentials = {
      about: 'Company Description Auth Signin',
      address: 'Company Address Auth Signin',
      phone: '081234567890',
      website: 'https://example-auth.com',
      employees: 10,
      name: 'Company Name Auth Signin',
      email: 'companyauthsign@example.com',
      password: 'P@ssw0rd!',
    };

    beforeAll(async () => {
      await prisma.user.create({
        data: {
          email: userSigninCredentials.email,
          name: userSigninCredentials.name,
          password_hash: await crypto.hashPassword(
            userSigninCredentials.password,
          ),
        },
      });

      await prisma.company.create({
        data: {
          name: companySigninCredentials.name,
          about: companySigninCredentials.about,
          address: companySigninCredentials.address,
          phone: companySigninCredentials.phone,
          website: companySigninCredentials.website,
          employees: companySigninCredentials.employees,
          user: {
            create: {
              name: companySigninCredentials.name,
              email: companySigninCredentials.email,
              password_hash: await crypto.hashPassword(
                companySigninCredentials.password,
              ),
              role: Role.COMPANY,
            },
          },
        },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: userSigninCredentials.email },
            { email: companySigninCredentials.email },
          ],
        },
      });
    });

    it('should log in a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: userSigninCredentials.email,
          password: userSigninCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data.user).toHaveProperty(
        'email',
        userSigninCredentials.email,
      );
      expect(response.body.data).toHaveProperty('token');
    });

    it('should log in a company successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: companySigninCredentials.email,
          password: companySigninCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data.user).toHaveProperty(
        'email',
        companySigninCredentials.email,
      );
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return unauthorized error if credentials are invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: userSigninCredentials.email,
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return validation error for invalid signin email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'invalid-email',
          password: userSigninCredentials.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error for missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: userSigninCredentials.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/refresh', () => {
    let accessToken: string;
    let refreshToken: string;

    const userCredentials = {
      name: 'User  Test Refresh',
      email: 'testuserrefresh@example.com',
      password: 'P@ssw0rd!',
    };

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: userCredentials.email,
          name: userCredentials.name,
          password_hash: await crypto.hashPassword(userCredentials.password),
        },
      });

      const token = await loginUser(
        userCredentials.email,
        userCredentials.password,
      );
      accessToken = token.access_token;
      refreshToken = token.refresh_token;
    });

    afterEach(async () => {
      await prisma.user.deleteMany({
        where: { email: userCredentials.email },
      });
    });

    it('should refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body.data.token).toHaveProperty('access_token');
      expect(response.body.data.token).toHaveProperty('refresh_token');
    });

    it('should throw an unauthorized error for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'wrong Refresh Token')
        .expect(401);
    });

    it('should throw an unauthorized error for missing refresh token', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should throw an unauthorized error for invalid access token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('DELETE /auth/signout', () => {
    let accessToken: string;
    let refreshToken: string;

    const userCredentials = {
      name: 'User  Test Signout',
      email: 'testuserlogout@example.com',
      password: 'P@ssw0rd!',
    };

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: userCredentials.email,
          name: userCredentials.name,
          password_hash: await crypto.hashPassword(userCredentials.password),
        },
      });

      const token = await loginUser(
        userCredentials.email,
        userCredentials.password,
      );
      accessToken = token.access_token;
      refreshToken = token.refresh_token;
    });

    afterEach(
      async () =>
        await prisma.user.deleteMany({
          where: { email: userCredentials.email },
        }),
    );
    it('should throw an unauthorized error for missing access token', async () => {
      await request(app.getHttpServer()).delete('/auth/signout').expect(401);
    });

    it('should throw an unauthorized error for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .delete('/auth/signout')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);
    });

    it('should sign out user', async () => {
      await request(app.getHttpServer())
        .delete('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should throw an unauthorized error for invalid access token', async () => {
      await request(app.getHttpServer())
        .delete('/auth/signout')
        .set('Authorization', 'wrong Access Token')
        .expect(401);
    });
  });
});
