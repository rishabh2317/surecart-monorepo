-- DropForeignKey
ALTER TABLE "public"."Brand" DROP CONSTRAINT "Brand_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Brand" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
