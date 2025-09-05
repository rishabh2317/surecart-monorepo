import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  console.log("🖼️ Updating product images...");

  const productsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "new_products.json"), "utf-8")
  );

  for (const p of productsData) {
    await prisma.product.update({
      where: { id: p.id },
      data: { imageUrls: p.imageUrls },
    });
    console.log(`✅ Updated images for: ${p.name}`);
  }

  console.log("🎯 Image URLs updated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error updating images:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
