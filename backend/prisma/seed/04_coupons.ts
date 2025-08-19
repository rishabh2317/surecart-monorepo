const { PrismaClient } = require("@prisma/client");


const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding coupons...");

  const creators = await prisma.user.findMany({ where: { role: "CREATOR" } });

  for (const creator of creators) {
    await prisma.coupon.upsert({
      where: { code: `WELCOME_${creator.id}` },
      update: {},
      create: {
        userId: creator.id,
        code: `WELCOME_${creator.id}`,
        description: "10% off your first order",
        imageUrl:
          "https://placehold.co/400x200/10b981/ffffff?text=Welcome+10%25+OFF",
      },
    });

    await prisma.coupon.upsert({
      where: { code: `FESTIVE_${creator.id}` },
      update: {},
      create: {
        userId: creator.id,
        code: `FESTIVE_${creator.id}`,
        description: "Flat ₹500 off during Festive Sale",
        imageUrl:
          "https://placehold.co/400x200/f59e0b/ffffff?text=Festive+500+OFF",
      },
    });
  }

  console.log("✅ Seeded coupons for all creators (safe re-run)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
