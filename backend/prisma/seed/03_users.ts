import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  // --- Creators ---
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

  // --- Regular Users ---
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

  console.log("✅ Seeded creators + users (safe re-run)");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
