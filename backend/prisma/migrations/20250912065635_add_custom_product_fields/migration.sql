-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "addedByUserId" TEXT,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
