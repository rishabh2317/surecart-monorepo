const { execSync } = require("child_process");


async function runSeed(file: string) {
  console.log(`\n🚀 Running ${file}...`);
  execSync(`ts-node prisma/seed/${file}`, { stdio: "inherit" });
}

async function main() {
  await runSeed("01_brands.ts");
  await runSeed("02_products.ts");
  await runSeed("03_users.ts");
  await runSeed("04_coupons.ts");
  await runSeed("05_transactions.ts");
  console.log("\n✅ All seeding scripts completed!");
}

main();
