import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { TransformResponseInterceptor } from '../src/common/inteceptors/response.interceptor';
import { CryptoUtil } from '../src/common/utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let crypto: CryptoUtil;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get(PrismaService);
    crypto = app.get(CryptoUtil);

    // Setup ValidationPipe dan Interceptor
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
    await prisma.user.deleteMany();
    await prisma.personalToken.deleteMany();
    await app.close();
  });

  const userCredentials = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'P@ssw0rd!',
    password_confirmation: 'P@ssw0rd!',
  };

  const companyCredentials = {
    ...userCredentials,
    name: 'Company Name',
    email: 'company@example.com',
    about: 'Company Description',
    phone: '081234567890',
    address: 'Company Address',
    website: 'https://example.com',
    employees: 10
  };

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(200);

    return response.body.data.token;
  };

  describe('POST /auth/signup', () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it('should register a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: userCredentials.name,
          email: userCredentials.email,
          password: userCredentials.password,
          password_confirmation: userCredentials.password_confirmation,
        })
        .expect(201);

      console.log(response.body);

      expect(response.body).toHaveProperty('message', 'User registered successfully',);
      expect(response.body.data.user).toHaveProperty('email', userCredentials.email);
    });

    it('should return conflict error if email already exists', async () => {
      await prisma.user.create({
        data: {
          name: userCredentials.name,
          email: userCredentials.email,
          password_hash: userCredentials.password,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: userCredentials.name,
          email: userCredentials.email,
          password: userCredentials.password,
          password_confirmation: userCredentials.password_confirmation,
        })
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Email already registered');
    });

    it('should return validation error for invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: userCredentials.name,
          email: 'invalidemail',
          password: userCredentials.password,
          password_confirmation: userCredentials.password_confirmation,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error if passwords do not match', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: userCredentials.name,
          email: userCredentials.email,
          password: userCredentials.password,
          password_confirmation: 'DifferentPassword!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: userCredentials.name,
          email: userCredentials.email,
          password: 'weak',
          password_confirmation: 'weak',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/company/signup', () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();
      await prisma.company.deleteMany();
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
      await prisma.company.deleteMany();
    });

    it('should register a company successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companyCredentials,
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Company registered successfully',
      );
      expect(response.body.data.user).toHaveProperty(
        'email',
        companyCredentials.email,
      );
    });

    it('should return conflict error if company email already exists', async () => {
      await prisma.user.create({
        data: {
          name: companyCredentials.name,
          email: companyCredentials.email,
          password_hash: await crypto.hashPassword(companyCredentials.password),
          role: 'COMPANY',
          company: {
            create: {
              name: companyCredentials.name,
              about: companyCredentials.about,
              phone: companyCredentials.phone,
              address: companyCredentials.address,
              website: companyCredentials.website,
              employees: companyCredentials.employees,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companyCredentials,
        })
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Email already registered');
    });

    it('should return validation error for invalid company email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companyCredentials,
          email: 'invalidemail',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error if company passwords do not match', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companyCredentials,
          password_confirmation: 'DifferentPassword!',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error for weak company password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/company/signup')
        .send({
          ...companyCredentials,
          password: 'weak',
          password_confirmation: 'weak',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/signin', () => {
    beforeAll(async () => {

      await prisma.company.deleteMany();
      await prisma.user.deleteMany();
      await prisma.user.create({
        data: {
          email: userCredentials.email,
          name: userCredentials.name,
          password_hash: await crypto.hashPassword(userCredentials.password), // Simulate hashed password
        },
      });

      await prisma.user.create({
        data: {
          email: companyCredentials.email,
          name: companyCredentials.name,
          password_hash: await crypto.hashPassword(companyCredentials.password), // Simulate hashed password
          role: 'COMPANY',
          company: {
            create: {
              name: companyCredentials.name,
              about: companyCredentials.about,
              phone: companyCredentials.phone,
              address: companyCredentials.address,
              website: companyCredentials.website,
              employees: companyCredentials.employees,
            },
          },
        },
      });
    });

    afterAll(async () => {
      await prisma.user.deleteMany();
      await prisma.company.deleteMany();
    });

    it('should log in a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data.user).toHaveProperty('email', userCredentials.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should log in a company successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: companyCredentials.email,
          password: companyCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data.user).toHaveProperty('email', companyCredentials.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return unauthorized error if credentials are invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: userCredentials.email,
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
          password: userCredentials.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return validation error for missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: userCredentials.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });


  describe('POST /auth/refresh', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: userCredentials.email,
          name: userCredentials.name,
          password_hash: await crypto.hashPassword(userCredentials.password)
        },
      });

      const token = await loginUser(userCredentials.email, userCredentials.password);
      accessToken = token.access_token;
      refreshToken = token.refresh_token;
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
      await prisma.personalToken.deleteMany();
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
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
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

    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: userCredentials.email,
          name: userCredentials.name,
          password_hash: await crypto.hashPassword(userCredentials.password)
        },
      });

      const token = await loginUser(userCredentials.email, userCredentials.password);
      accessToken = token.access_token;
      refreshToken = token.refresh_token;
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
      await prisma.personalToken.deleteMany();
    });

    it ('should throw an unauthorized error for missing access token', async () => {
      await request(app.getHttpServer())
        .delete('/auth/signout')
        .expect(401);
    });

    it ('should throw an unauthorized error for invalid refresh token', async () => {
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
