-- DropForeignKey
ALTER TABLE "public"."Click" DROP CONSTRAINT "Click_collectionId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Click" ADD CONSTRAINT "Click_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Click" ADD CONSTRAINT "Click_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
