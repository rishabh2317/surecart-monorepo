import { execSync } from "child_process";

// This function remains the same, but will be called with fewer files.
async function runSeed(file: string) {
  console.log(`\n🚀 Running ${file}...`);
  execSync(`ts-node prisma/seed/${file}`, { stdio: "inherit" });
}

async function main() {
  // We now only need to run the main seed script and the user/coupon/transaction seeds.
  await runSeed("01_main_seed.ts"); 
  await runSeed("03_users.ts");
  await runSeed("04_coupons.ts");
  await runSeed("05_transactions.ts");
  // The old 06_campaigns.ts is no longer needed as its logic is in 01_main_seed.ts
  
  console.log("\n✅ All seeding scripts completed!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});