"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Seeding brands...");
    const filePath = path.join(__dirname, "../data.json");
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const uniqueBrandNames = Array.from(new Set(raw.map((p) => p.brand?.name).filter((n) => !!n)));
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
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=01_brands.js.map