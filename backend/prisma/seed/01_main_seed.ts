import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM-friendly __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting unified seeding process...");

  // 1. Load data from JSON file
  const rawData = fs.readFileSync(path.join(__dirname, "data.json"), "utf-8");
  const productsData: any[] = JSON.parse(rawData);

  // 2. Create a default user for brand ownership
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

  // 3. Create Affiliate Campaigns (Amazon, Flipkart, Myntra)
  const affiliateCampaigns = [];
  const affiliateData = [
    { id: "amazon", name: "Amazon Associates", cover: "https://placehold.co/600x400/FF9900/FFFFFF?text=Amazon" },
    { id: "flipkart", name: "Flipkart Affiliates", cover: "https://placehold.co/600x400/2874F0/FFFFFF?text=Flipkart" },
    { id: "myntra", name: "Myntra Affiliates", cover: "https://placehold.co/600x400/E40046/FFFFFF?text=Myntra" }
  ];

  const marketplaceBrand = await prisma.brand.upsert({
      where: { name: 'Marketplace' },
      update: {},
      create: { name: 'Marketplace', userId: defaultUser.id }
  });

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
              isActive: true
          }
      });
      affiliateCampaigns.push(campaign);
      console.log(`🛍️  Ensured campaign exists: ${campaign.name}`);
  }

  // 4. Process all products, brands, and link them to campaigns
  for (const p of productsData) {
    // Upsert Brand
    const brand = await prisma.brand.upsert({
      where: { name: p.brand?.name || "Unknown Brand" },
      update: {},
      create: {
        name: p.brand?.name || "Unknown Brand",
        websiteUrl: p.baseUrl ? new URL(p.baseUrl).origin : null,
        userId: defaultUser.id,
      },
    });

    // Upsert Product
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

    // Link product to all affiliate campaigns
    for (const campaign of affiliateCampaigns) {
        await prisma.campaignProduct.upsert({
            where: {
                campaignId_productId: {
                    campaignId: campaign.id,
                    productId: product.id,
                }
            },
            update: {},
            create: {
                campaignId: campaign.id,
                productId: product.id
            }
        });
    }
  }
  console.log(`✅ Processed and linked ${productsData.length} products to campaigns.`);
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