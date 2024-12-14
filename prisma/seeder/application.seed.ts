import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { ContractSeeder } from './index';
import { faker } from '@faker-js/faker';

export class ApplicationSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    // Fetch all users and jobs from the database
    const users = await prisma.user.findMany({
      where: { role: 'JOBSEEKER' }, // Only job seekers can apply
    });
    const jobs = await prisma.job.findMany();

    if (users.length === 0 || jobs.length === 0) {
      console.log(
        'No users or jobs found. Please seed users and jobs before creating applications.',
      );
      return;
    }

    // Generate applications
    const applications = Array.from({ length: 20 }, () => ({
      user_id: faker.helpers.arrayElement(users).id,
      job_id: faker.helpers.arrayElement(jobs).id,
      status: faker.helpers.arrayElement(Object.values(ApplicationStatus)),
    }));

    // Seed applications
    await Promise.all(
      applications.map(async (application) => {
        await prisma.application.create({
          data: {
            user: {
              connect: {
                id: application.user_id,
              },
            },
            job: {
              connect: {
                id: application.job_id,
              },
            },
            status: application.status,
          },
        });
      }),
    );

    console.log('Applications seeded successfully 🚀');
  }

  static async clear(prisma: PrismaClient): Promise<void> {
    await prisma.application.deleteMany();
    console.log('Applications cleared successfully 🧹');
  }
}
