import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname polyfill for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding brands...");

  const filePath = path.join(__dirname, "/data.json");
  const raw: any[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const uniqueBrandNames = Array.from(
    new Set(raw.map((p) => p.brand?.name).filter((n): n is string => !!n))
  );

  for (const name of uniqueBrandNames) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`✅ Seeded ${uniqueBrandNames.length} brands (safe re-run)`);
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
