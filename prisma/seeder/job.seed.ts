import { PrismaClient } from '@prisma/client';
import { ContractSeeder } from './index';
import { faker } from '@faker-js/faker';

export class JobSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    // Fetch existing companies
    const companies = await prisma.company.findMany();

    if (companies.length === 0) {
      console.log('No companies found. Please seed companies before creating jobs.');
      return;
    }

    // Generate jobs for each company
    const jobs = companies.flatMap((company) =>
      Array.from({ length: 5 }, () => ({
        title: faker.person.jobTitle(),
        description: faker.lorem.paragraphs(2),
        salary_start: faker.number.int({ min: 30000, max: 50000 }),
        salary_end: faker.number.int({ min: 50001, max: 100000 }),
        start_date: faker.date.future({ years: 1 }),
        end_date: faker.date.future({ years: 2 }),
        company_at: company.id,
      })),
    );

    // Seed jobs
    await Promise.all(
      jobs.map(async (job) => {
        await prisma.job.create({
          data: {
            title: job.title,
            description: job.description,
            salary_start: job.salary_start,
            salary_end: job.salary_end,
            start_date: job.start_date,
            end_date: job.end_date,
            company: {
              connect: {
                id: job.company_at,
              },
            },
          },
        });
      }),
    );

    console.log('Jobs seeded successfully 🚀');
  }

  static async clear(prisma: PrismaClient): Promise<void> {
    await prisma.job.deleteMany();
    console.log('Jobs cleared successfully 🧹');
  }
}
