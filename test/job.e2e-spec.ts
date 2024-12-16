import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/core/database/prisma.service';
import { AppModule } from '../src/app.module';
import { CryptoUtil } from '../src/common/utils';
import { TransformResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('JobController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let crypto: CryptoUtil;

  let companyAccess: string;
  let userAccess: string;
  let personalTokenId: Array<string> = [];

  const companyCredentials = {
    id: 'test-company-job-id',
    name: 'Test Company Job',
    about: 'We are a test company',
    address: 'Test City',
    phone: '123456789',
    website: 'https://testcompanyjob.com',
    employees: 10,
    user: {
      id: 'test-company-user-job-id',
      email: 'testcompanyjob@example.com',
      password: 'testpassword',
      role: Role.COMPANY,
    },
  };

  const userCredentials = {
    id: 'test-user-job-id',
    name: 'Test User Job',
    email: 'testuserjob@example.com',
    password: 'testpassword',
    role: Role.JOBSEEKER,
  };

  const loginUser = async (email: string, password: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(200);

    const personalToken = await prisma.personalToken.findUnique({
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
    crypto = app.get<CryptoUtil>(CryptoUtil);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    await app.init();

    // Create company and user
    await prisma.company.create({
      data: {
        id: companyCredentials.id,
        name: companyCredentials.name,
        about: companyCredentials.about,
        phone: companyCredentials.phone,
        website: companyCredentials.website,
        address: companyCredentials.address,
        employees: companyCredentials.employees,
        user: {
          create: {
            name: companyCredentials.name,
            email: companyCredentials.user.email,
            password_hash: await crypto.hashPassword(
              companyCredentials.user.password,
            ),
            role: companyCredentials.user.role,
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        id: userCredentials.id,
        name: userCredentials.name,
        email: userCredentials.email,
        password_hash: await crypto.hashPassword(userCredentials.password),
        role: userCredentials.role,
      },
    });

    // Login to get access tokens
    companyAccess = await loginUser(
      companyCredentials.user.email,
      companyCredentials.user.password,
    );
    userAccess = await loginUser(
      userCredentials.email,
      userCredentials.password,
    );
  });

  afterAll(async () => {
    // Clear existing users and companies
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: userCredentials.email },
          { email: companyCredentials.user.email },
        ],
      },
    });

    await prisma.personalToken.deleteMany({
      where: { id: { in: personalTokenId } },
    });
    await app.close();
  });

  describe('POST /jobs', () => {
    it('should create a new job', async () => {
      const response = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop and maintain software applications',
          salary_start: 5000,
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Job created successfully');
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return a bad request error for invalid job data', async () => {
      const response = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: '', // Invalid title
          description: 'Develop and maintain software applications',
          salary_start: -5000, // Invalid salary
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /jobs', () => {
    it('should get all jobs', async () => {
      // Create a job first to ensure there are jobs to retrieve
      await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop and maintain software applications',
          salary_start: 5000,
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      const response = await request(app.getHttpServer())
        .get('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Jobs retrieved successfully');
      expect(response.body.data.jobs).toBeInstanceOf(Array);
      expect(response.body.data.jobs.length).toBeGreaterThan(0);
    });
  });

  describe('GET /jobs/:id', () => {
    it('should get a job by ID', async () => {
      const jobResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop and maintain software applications',
          salary_start: 5000,
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      const jobId = jobResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${companyAccess}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Job retrieved successfully');
      expect(response.body.data.job).toHaveProperty('id', jobId);
    });

    it('should return a not found error for a non-existent job ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/jobs/non-existent-id')
        .set('Authorization', `Bearer ${companyAccess}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Job not found');
    });
  });

  describe('PUT /jobs/:id', () => {
    it('should update a job by ID', async () => {
      const jobResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop and maintain software applications',
          salary_start: 5000,
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      const jobId = jobResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .put(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'Lead software development projects',
          salary_start: 7000,
          salary_end: 12000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Job updated successfully');
      expect(response.body.data).toHaveProperty('id', jobId);
    });

    it('should return a not found error for updating a non-existent job ID', async () => {
      const response = await request(app.getHttpServer())
        .put('/jobs/non-existent-id')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Updated Job Title',
          description: 'Updated Job Description',
          salary_start: 6000,
          salary_end: 11000,
          start_date: '2024-01-01 ',
          end_date: '2024-12-31',
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Job not found');
    });

    it('should return a bad request error for invalid job update data', async () => {
      const jobResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop and maintain software applications',
          salary_start: 5000,
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      const jobId = jobResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .put(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: '', // Invalid title
          description: 'Updated Job Description',
          salary_start: -6000, // Invalid salary
          salary_end: 11000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('DELETE /jobs/:id', () => {
    it('should delete a job by ID', async () => {
      const jobResponse = await request(app.getHttpServer())
        .post('/jobs')
        .set('Authorization', `Bearer ${companyAccess}`)
        .send({
          title: 'Software Engineer',
          description: 'Develop and maintain software applications',
          salary_start: 5000,
          salary_end: 10000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        });

      const jobId = jobResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${companyAccess}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Job deleted successfully');
    });

    it('should return a not found error for deleting a non-existent job ID', async () => {
      const response = await request(app.getHttpServer())
        .delete('/jobs/non-existent-id')
        .set('Authorization', `Bearer ${companyAccess}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Job not found');
    });
  });
});
