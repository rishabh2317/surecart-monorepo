import { execSync } from "child_process";

async function runSeed(file: string) {
  console.log(`\n🚀 Running ${file}...`);
  execSync(`ts-node prisma/seed/${file}`, { stdio: "inherit" });
}

async function main() {
  // Unified main seed now handles categories, products, productCategories, and campaigns
  await runSeed("01_main_seed.ts");

  // Keep any extra domain-specific seeds you still need
  await runSeed("03_users.ts");
  await runSeed("04_coupons.ts");
  await runSeed("05_transactions.ts");

  console.log("\n✅ All seeding scripts completed!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
