import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding additional products...");

  const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, "new_products.json"), "utf-8"));
  const productCategoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, "new_productCategories.json"), "utf-8"));

  const defaultUser = await prisma.user.findFirst({ where: { email: "default@system.com" } });

  for (const p of productsData) {
    const brand = await prisma.brand.upsert({
      where: { name: p.brand?.name || "Unknown Brand" },
      update: {},
      create: {
        name: p.brand?.name || "Unknown Brand",
        websiteUrl: p.baseUrl ? new URL(p.baseUrl).origin : null,
        userId: defaultUser?.id,
      },
    });

    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        source: p.source,
        sourceProductId: p.sourceProductId,
        name: p.name,
        description: p.description,
        imageUrls: p.imageUrls || [],
        baseUrl: p.baseUrl,
        brandId: brand.id,
        price: p.price,
        currency: p.currency || "INR",
      },
    });
  }

  for (const pc of productCategoriesData) {
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: pc.productId, categoryId: pc.categoryId } },
      update: {},
      create: { productId: pc.productId, categoryId: pc.categoryId },
    });
  }

  console.log("✅ Additional products seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
