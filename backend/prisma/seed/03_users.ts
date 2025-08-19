const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");


const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  for (let i = 1; i <= 3; i++) {
    await prisma.user.upsert({
      where: { email: `creator${i}@surecart.dev` },
      update: {},
      create: {
        email: `creator${i}@surecart.dev`,
        username: `creator${i}`,
        authProviderId: await bcrypt.hash("password123", 10),
        role: "CREATOR",
      },
    });
  }

  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { email: `user${i}@mail.com` },
      update: {},
      create: {
        email: `user${i}@mail.com`,
        username: `user${i}`,
        authProviderId: await bcrypt.hash("password123", 10),
        role: "USER",
      },
    });
  }

  console.log(`✅ Seeded creators + users (safe re-run)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
