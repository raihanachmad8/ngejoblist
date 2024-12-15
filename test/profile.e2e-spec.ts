// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from '../src/app.module';
// import { PrismaService } from '../src/core/database/prisma.service';
// import { TransformResponseInterceptor } from '../src/common/inteceptors/response.interceptor';
// import { CryptoUtil } from '../src/common/utils';
// import * as path from 'path';

// describe('ProfilesController (e2e)', () => {
//   let app: INestApplication;
//   let prisma: PrismaService;
//   let crypto: CryptoUtil;
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//     app = moduleFixture.createNestApplication();

//     prisma = app.get(PrismaService);
//     crypto = app.get(CryptoUtil);

//     // Setup ValidationPipe and Interceptor
//     app.useGlobalPipes(
//       new ValidationPipe({
//         transform: true,
//         whitelist: true,
//         forbidNonWhitelisted: true,
//       }),
//     );
//     app.useGlobalInterceptors(new TransformResponseInterceptor());

//     await app.init();

//     // Generate JWT token for the user
//   });

//   afterAll(async () => {
//     // Cleanup database
//     await prisma.user.deleteMany();
//     await prisma.personalToken.deleteMany();
//     await app.close();
//   });

//   const userCredentials = {
//     name: 'John sdfsdf',
//     email: 'johnsdfsdf@example.com',
//     password: 'P@ssw0rd!',
//     password_confirmation: 'P@ssw0rd!',
//   };

//   const loginUser = async (email: string, password: string) => {
//     const response = await request(app.getHttpServer())
//       .post('/auth/signin')
//       .send({ email, password })
//       .expect(200);

//     return response.body.data.token;
//   };

//   describe('PATCH /profiles', () => {
//     let accessToken: string;
//     let refreshToken: string;

//     beforeEach(async () => {
//       await prisma.user.create({
//         data: {
//           email: userCredentials.email,
//           name: userCredentials.name,
//           password_hash: await crypto.hashPassword(userCredentials.password),
//         },
//       });

//       const token = await loginUser(
//         userCredentials.email,
//         userCredentials.password,
//       );
//       accessToken = token.access_token;
//       refreshToken = token.refresh_token;

//     });

//     afterEach(async () => {
//       await prisma.user.deleteMany();
//     });

//     it('should update user profile successfully', async () => {
//       const response = await request(app.getHttpServer())
//         .patch('/profiles')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           name: 'Updated User',
//           portfolio: 'https://portfolio.com',
//           cv: 'https://cv.com',
//         })
//         .expect(200);

//       expect(response.body).toHaveProperty('message', 'Profile updated successfully');
//       expect(response.body.data.user.name).toBe('Updated User');
//       expect(response.body.data.user.portfolio).toBe('https://portfolio.com');
//       expect(response.body.data.user.cv).toBe('https://cv.com');
//     });

//     it('should return 404 if user not found', async () => {

//       const response = await request(app.getHttpServer())
//         .patch('/profiles')
//         .set('Authorization', `Bearer ${refreshToken}`)
//         .send({
//           name: 'Invalid User',
//           portfolio: 'https://portfolio.com',
//           cv: 'https://cv.com',
//         })
//         .expect(401);

//       expect(response.body).toHaveProperty('message', 'Unauthorized');
//     });

//     it('should return 400 if name is too short', async () => {
//       const response = await request(app.getHttpServer())
//         .patch('/profiles')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           name: 'A',
//         })
//         .expect(400);

//       expect(response.body).toHaveProperty('message', 'Validation failed');
//     });
//   });

//   describe('PUT /profiles/photo', () => {
//     let accessToken: string;

//     beforeEach(async () => {
//       await prisma.user.create({
//         data: {
//           email: userCredentials.email,
//           name: userCredentials.name,
//           password_hash: await crypto.hashPassword(userCredentials.password),
//         },
//       });

//       const token = await loginUser(
//         userCredentials.email,
//         userCredentials.password,
//       );
//       accessToken = token.access_token;
//     });

//     afterEach(async () => {
//       await prisma.user.deleteMany();
//     });

//     it('should upload profile photo successfully', async () => {
//       const filePath = path.join(__dirname, 'image.png');

//       const response = await request(app.getHttpServer())
//         .put('/profiles/photo')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .attach('file', filePath)
//         .expect(200);

//       expect(response.body).toHaveProperty('message', 'Profile photo uploaded successfully');
//       expect(response.body.data.user.profile).toMatch(/https:\/\/res.cloudinary.com/); // Check Cloudinary URL
//     });

//     it('should return 400 if no file is attached', async () => {
//       const response = await request(app.getHttpServer())
//         .put('/profiles/photo')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(400);

//       expect(response.body).toHaveProperty('message', 'No file uploaded');
//     });
//   });

//   describe('DELETE /profiles/photo', () => {
//     let accessToken: string;

//     beforeEach(async () => {
//       await prisma.user.create({
//         data: {
//           email: userCredentials.email,
//           name: userCredentials.name,
//           password_hash: await crypto.hashPassword(userCredentials.password),
//         },
//       });

//       const token = await loginUser(
//         userCredentials.email,
//         userCredentials.password,
//       );
//       accessToken = token.access_token;
//     });

//     afterEach(async () => {
//       await prisma.user.deleteMany();
//     });

//     it('should delete profile photo successfully', async () => {
//       // Upload a photo first to delete it
//       const filePath = path.join(__dirname, 'image.png');
//       await request(app.getHttpServer())
//         .put('/profiles/photo')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .attach('file', filePath)
//         .expect(200);

//       const response = await request(app.getHttpServer())
//         .delete('/profiles/photo')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(200);

//       expect(response.body).toHaveProperty(
//         'message',
//         'Profile photo deleted successfully',
//       );
//       expect(response.body.data.user.profile).toBeNull();
//     });

//     it('should return 404 if no photo exists', async () => {
//       const response = await request(app.getHttpServer())
//         .delete('/profiles/photo')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .expect(404);

//       expect(response.body).toHaveProperty(
//         'message',
//         'Profile photo not found',
//       );
//     });
//   });

//   describe('PATCH /profiles/change-password', () => {
//     let accessToken: string;

//     beforeEach(async () => {
//       await prisma.user.create({
//         data: {
//           email: userCredentials.email,
//           name: userCredentials.name,
//           password_hash: await crypto.hashPassword(userCredentials.password),
//         },
//       });

//       const token = await loginUser(
//         userCredentials.email,
//         userCredentials.password,
//       );
//       accessToken = token.access_token;
//     });

//     afterEach(async () => {
//       await prisma.user.deleteMany();
//     });
//     it('should change password successfully', async () => {
//       console.log('accessToken : ', accessToken);
//       const response = await request(app.getHttpServer())
//         .patch('/profiles/change-password')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           currentPassword: userCredentials.password,
//           newPassword: 'NewPassword@1234',
//           confirmNewPassword: 'NewPassword@1234',
//         })
//         .expect(200);

//       expect(response.body).toHaveProperty(
//         'message',
//         'Password updated successfully',
//       );
//     });

//     it('should return 400 if new password and confirmation do not match', async () => {
//       const response = await request(app.getHttpServer())
//         .patch('/profiles/change-password')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           currentPassword: userCredentials.password,
//           newPassword: 'NewPassword@1234',
//           confirmNewPassword: 'DifferentPassword@1234',
//         })
//         .expect(400);

//       expect(response.body).toHaveProperty(
//         'message',
//         'Validation failed',
//       );
//     });

//     it('should return 400 if current password is incorrect', async () => {
//       const response = await request(app.getHttpServer())
//         .patch('/profiles/change-password')
//         .set('Authorization', `Bearer ${accessToken}`)
//         .send({
//           currentPassword: 'wrongPassword123',
//           newPassword: 'NewPassword@1234',
//           confirmNewPassword: 'NewPassword@1234',
//         })
//         .expect(400);

//       expect(response.body).toHaveProperty(
//         'message',
//         'Validation failed',
//       );
//     });
//   });
// });