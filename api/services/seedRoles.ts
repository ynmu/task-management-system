// seedRoles.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const roleNames = [
  "Director",
  "Coordinator",
  "Fundraiser",
  "Volunteer"
];

async function seedRoles() {
  try {
    for (const roleName of roleNames) {
      const roleExists = await prisma.role.findUnique({
        where: { roleName }
      });

      if (!roleExists) {
        await prisma.role.create({
          data: { roleName }
        });
        console.log(`User role "${roleName}" created.`);
      } else {
        console.log(`User role "${roleName}" already exists.`);
      }
    }
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default seedRoles;
