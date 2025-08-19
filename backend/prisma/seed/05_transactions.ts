const { PrismaClient } = require("@prisma/client");


const prisma = new PrismaClient();

function randPrice(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function main() {
  console.log("🌱 Seeding transactions...");

  const users = await prisma.user.findMany();

  for (const user of users) {
    // Only add if no transaction exists for this user
    const existing = await prisma.transaction.findFirst({
      where: { userId: user.id },
    });

    if (!existing) {
      await prisma.transaction.createMany({
        data: [
          {
            userId: user.id,
            type: "COMMISSION",
            status: "APPROVED",
            amount: randPrice(50, 500),
            currency: "INR",
            description: "Sale from affiliate link",
          },
          {
            userId: user.id,
            type: "WITHDRAWAL",
            status: "PENDING",
            amount: -randPrice(100, 300),
            currency: "INR",
            description: "Withdrawal to bank",
          },
        ],
      });
    }
  }

  console.log("✅ Seeded transactions (safe re-run)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
