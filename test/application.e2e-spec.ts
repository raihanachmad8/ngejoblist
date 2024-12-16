import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/core/database/prisma.service';
import { AppModule } from '../src/app.module';
import { TransformResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { CryptoUtil } from '../src/common/utils';
import * as cuid from 'cuid';
import { Role } from '@prisma/client';

describe('ApplicationController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cripto: CryptoUtil;

  let userAccessToken: string;
  let companyAccessToken: string;

  let user_id: string;
  let company_id: string;
  let jobId: string;
  let applicationId: string;

  let personalTokenId: Array<string> = [];

  const userCredentials = {
    name: 'Test User Applicant',
    email: 'testuserapplication@example.com',
    password: 'P@ssw0rd!2',
  };

  const companyCredentials = {
    name: 'Test Company Applicant',
    email: 'testcompanyapplicant@example.com',
    password: 'P@ssw0rd!2',
    about: 'We are a test company',
    address: '123 Test Street',
    phone: '1234567890',
    website: 'https://exampleapplication.com',
    employees: 100,
  };

  const jobData = {
    title: 'Software Developer',
    description: 'Develop and maintain software',
    salary_start: 5000,
    salary_end: 10000,
    start_date: new Date('2024-01-01').toISOString(),
    end_date: new Date('2024-12-31').toISOString(),
  };

  let applicationData = {
    job_id: '',
    user_id: '',
  };

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(200);

    const personalToken = await prisma.personalToken.findFirst({
      where: { access_token: response.body.data.token.access_token },
    });

    personalTokenId.push(personalToken.id);
    return response.body.data.token.access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    cripto = app.get<CryptoUtil>(CryptoUtil);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    await app.init();

    // Create user and get token
    const user = await prisma.user.create({
      data: {
        name: userCredentials.name,
        email: userCredentials.email,
        password_hash: await cripto.hashPassword(userCredentials.password),
      },
    });

    user_id = user.id;
    const company = await prisma.company.create({
      data: {
        name: companyCredentials.name,
        user: {
          create: {
            name: companyCredentials.name,
            email: companyCredentials.email,
            password_hash: await cripto.hashPassword(
              companyCredentials.password,
            ),
            role: Role.COMPANY,
          },
        },
        about: companyCredentials.about,
        address: companyCredentials.address,
        phone: companyCredentials.phone,
        website: companyCredentials.website,
        employees: companyCredentials.employees,
      },
    });

    company_id = company.id;

    userAccessToken = await loginUser(
      userCredentials.email,
      userCredentials.password,
    );

    companyAccessToken = await loginUser(
      companyCredentials.email,
      companyCredentials.password,
    );

    // Create a job for testing
    const jobResponse = await prisma.job.create({
      data: {
        ...jobData,
        company: { connect: { id: company_id } },
      },
    });
    jobId = jobResponse.id;
    applicationData.job_id = jobId;
    applicationData.user_id = user_id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: companyCredentials.email },
          { email: userCredentials.email },
        ],
      },
    });
    await app.close();
  });

  describe('POST /applications', () => {
    it('should create a new application', async () => {
      const response = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Application created successfully');
      expect(response.body.data).toHaveProperty('id');

      applicationId = response.body.data.id;
    });

    it('should return validation errors for invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({}); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toBeDefined();
    });

    it('should return a forbidden error for unauthorized users', async () => {
      const response = await request(app.getHttpServer())
        .post('/applications')
        .set('Authorization', `Bearer ${companyAccessToken}`)
        .send(applicationData);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /applications/:id', () => {
    it('should get an application by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${userAccessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Application retrieved successfully');
      expect(response.body.data.application).toHaveProperty('id', applicationId);
    });

    it('should return a not found error for a non-existent application', async () => {
      const notFoundID = cuid();
      const response = await request(app.getHttpServer())
        .get(`/applications/${notFoundID}`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Application not found');
    });
  });

  describe('PUT /applications/:id', () => {
    it('should update an application', async () => {
      const response = await request(app.getHttpServer())
        .put(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${companyAccessToken}`)
        .send({ status: 'ACCEPTED' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Application updated successfully');
      expect(response.body.data).toHaveProperty('status', 'ACCEPTED');
    });

    it('should return validation errors for invalid update data', async () => {
      const response = await request(app.getHttpServer())
        .put(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${companyAccessToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toBeDefined();
    });

    it('should return a not found error for a non-existent application', async () => {
      const notFoundID = cuid();
      const response = await request(app.getHttpServer())
        .put(`/applications/${notFoundID}`)
        .set('Authorization', `Bearer ${companyAccessToken}`)
        .send({ status: 'ACCEPTED' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Application not found');
    });

    it('should return a forbidden error for unauthorized users', async () => {
      const response = await request(app.getHttpServer())
        .put(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ status: 'ACCEPTED' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /applications', () => {
    it('should filter applications', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ job_id: jobId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Applications retrieved successfully');
      expect(response.body.data.applications).toBeInstanceOf(Array);
    });
  });

  describe('DELETE /applications/:id', () => {
    it('should cancel an application', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/applications/${applicationId}`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Application cancelled successfully');
    });

    it('should return a not found error for non-existent application', async () => {
      const notFoundID = cuid();
      const response = await request(app.getHttpServer())
        .delete(`/applications/${notFoundID}`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Application not found');
    });
  });

  it('should return a forbidden error for unauthorized users', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/applications/${applicationId}`)
      .set('Authorization', `Bearer ${companyAccessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Access denied');
  });
});
