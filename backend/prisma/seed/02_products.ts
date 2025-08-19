const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding process...');

  // 0. Load JSON file
  const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8');
  const products = JSON.parse(rawData);

  // 1. Ensure default user exists
  const defaultUser = await prisma.user.upsert({
    where: { email: 'default@system.com' },
    update: {},
    create: {
      authProviderId: 'system',
      username: 'default_user',
      email: 'default@system.com',
      role: 'ADMIN',
      fullName: 'System Default User',
    },
  });
  console.log(`👤 Using default user: ${defaultUser.id}`);

  // 2. Loop through products
  for (const p of products) {
    // --- BRAND ---
    const brand = await prisma.brand.upsert({
      where: { name: p.brandName || 'Unknown Brand' },
      update: {},
      create: {
        name: p.brandName || 'Unknown Brand',
        websiteUrl: p.baseUrl ? new URL(p.baseUrl).origin : null,
        userId: defaultUser.id, // ✅ Required field
      },
    });

    // --- PRODUCT ---
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        source: p.source,
        sourceProductId: p.sourceProductId,
        name: p.name,
        description:
          p.description ||
          `High-quality ${p.name} from ${p.brandName || 'Unknown Brand'}.`,
        imageUrls: p.imageUrls || [],
        baseUrl: p.baseUrl,
        brandId: brand.id,
        price: p.price ? Number(p.price) : null,
        currency: p.currency || 'INR',
      },
    });

    console.log(`✅ Seeded product: ${p.name}`);
  }

  console.log(`🎯 Seeding complete. Total products processed: ${products.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
