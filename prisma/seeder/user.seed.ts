import { PrismaClient, Role } from '@prisma/client';
import { ContractSeeder } from './index';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
export class UserSeeder extends ContractSeeder {
  static async seed(prisma: PrismaClient): Promise<void> {
    const admin = [
      {
        name: 'admin',
        email: 'admin@example.com',
        password: 'Password@1234',
        salt: bcrypt.genSaltSync(10),
        role: Role.ADMIN,
      },
    ];

    const company = Array.from({ length: 5 }, (_, i) => {
      return {
        company: {
          name: faker.company.name(),
          about: faker.lorem.paragraph(),
          address: faker.location.streetAddress(),
          employees: faker.number.int({
            min: 10,
            max: 1000,
          }),
          phone: faker.helpers.replaceSymbols('08############'),
          website: faker.internet.url(),
          user: {
            name: faker.company.name(),
        email: 'company' + i + '@example.com',
        password: 'Password@1234',
        salt: bcrypt.genSaltSync(10),
        role: Role.COMPANY,
      }
        },
      };
    });

    const user = Array.from({ length: 10 }, (_, i) => {
      return {
        name: faker.person.fullName(),
        email: 'user' + i + '@example.com',
        password: 'Password@1234',
        salt: bcrypt.genSaltSync(10),
        role: Role.JOBSEEKER,
      };
    });

    await Promise.all(
      [...admin, ...user].map(async (user) => {
        await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            password_hash: bcrypt.hashSync(user.password, user.salt),
          },
        });
      }),
    );

    await Promise.all(
      [...company].map(async (company) => {
        await prisma.company.create({
          data: {
            name: company.company.name,
            about: company.company.about,
            address: company.company.address,
            employees: company.company.employees,
            phone: company.company.phone,
            website: company.company.website,
            user: {
              create: {
                name: company.company.user.name,
                email: company.company.user.email,
                password_hash: bcrypt.hashSync(
                  company.company.user.password,
                  company.company.user.salt,
                ),
              },
            },
          },
        });
      }),
    );

    console.log('User seeded completed 🚀');
  }

  static async clear(prisma: PrismaClient): Promise<void> {
    await prisma.user.deleteMany();
    console.log('Jobs cleared successfully 🧹');
  }
}
