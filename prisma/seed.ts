import { PrismaClient } from '@prisma/client';
import { UserSeeder } from './seeder';
import { JobSeeder } from './seeder/job.seed';
import { ApplicationSeeder } from './seeder/application.seed';

const prisma = new PrismaClient();

async function main() {
  Promise.race([
    await clear(),
    await UserSeeder.seed(prisma),
    await JobSeeder.seed(prisma),
    await ApplicationSeeder.seed(prisma),
  ]);
}

async function clear() {
  await ApplicationSeeder.clear(prisma);
  await JobSeeder.clear(prisma);
  await UserSeeder.clear(prisma);
}

main()
  .catch((e) => {
    console.error('Unhandled error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
