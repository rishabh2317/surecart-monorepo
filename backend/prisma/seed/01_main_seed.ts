import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting unified seeding process...");

  // 1. Load JSON data
  const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, "categories.json"), "utf-8"));
  const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, "products.json"), "utf-8"));
  const productCategoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, "productCategories.json"), "utf-8"));

  // 2. Default user
  const defaultUser = await prisma.user.upsert({
    where: { email: "default@system.com" },
    update: {},
    create: {
      authProviderId: "system",
      username: "default_user",
      email: "default@system.com",
      role: "ADMIN",
      fullName: "System Default User",
    },
  });
  console.log(`👤 Using default user: ${defaultUser.id}`);

  // 3. Categories
  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name },
      create: { id: c.id, name: c.name },
    });
  }
  console.log(`📂 Inserted/updated ${categoriesData.length} categories.`);

  // 4. Marketplace brand
  const marketplaceBrand = await prisma.brand.upsert({
    where: { name: "Marketplace" },
    update: {},
    create: { name: "Marketplace", userId: defaultUser.id },
  });

  // 5. Affiliate campaigns
  const affiliateData = [
    { id: "amazon", name: "Amazon Associates", cover: "https://placehold.co/600x400/FF9900/FFFFFF?text=Amazon" },
    { id: "flipkart", name: "Flipkart Affiliates", cover: "https://placehold.co/600x400/2874F0/FFFFFF?text=Flipkart" },
    { id: "myntra", name: "Myntra Affiliates", cover: "https://placehold.co/600x400/E40046/FFFFFF?text=Myntra" },
  ];
  const affiliateCampaigns = [];
  for (const aff of affiliateData) {
    const campaign = await prisma.campaign.upsert({
      where: { id: aff.id },
      update: {},
      create: {
        id: aff.id,
        name: aff.name,
        brandId: marketplaceBrand.id,
        coverImageUrl: aff.cover,
        description: `Top products from ${aff.name}`,
        isActive: true,
      },
    });
    affiliateCampaigns.push(campaign);
    console.log(`🛍️ Campaign ready: ${campaign.name}`);
  }

  // 6. Products
  for (const p of productsData) {
    const brand = await prisma.brand.upsert({
      where: { name: p.brand?.name || "Unknown Brand" },
      update: {},
      create: {
        name: p.brand?.name || "Unknown Brand",
        websiteUrl: p.baseUrl ? new URL(p.baseUrl).origin : null,
        userId: defaultUser.id,
      },
    });

    const product = await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        source: p.source,
        sourceProductId: p.sourceProductId,
        name: p.name,
        description: p.description || `High-quality ${p.name} from ${p.brand?.name || "Unknown Brand"}.`,
        imageUrls: p.imageUrls || [],
        baseUrl: p.baseUrl,
        brandId: brand.id,
        price: p.price ? Number(p.price) : null,
        currency: p.currency || "INR",
      },
    });

    // Link to all affiliate campaigns
    for (const campaign of affiliateCampaigns) {
      await prisma.campaignProduct.upsert({
        where: { campaignId_productId: { campaignId: campaign.id, productId: product.id } },
        update: {},
        create: { campaignId: campaign.id, productId: product.id },
      });
    }
  }
  console.log(`✅ Inserted/updated ${productsData.length} products.`);

  // 7. Product-Category mapping
  for (const pc of productCategoriesData) {
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: pc.productId, categoryId: pc.categoryId } },
      update: {},
      create: { productId: pc.productId, categoryId: pc.categoryId },
    });
  }
  console.log(`🔗 Linked ${productCategoriesData.length} product-category relationships.`);

  console.log("🎯 Unified seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during unified seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
