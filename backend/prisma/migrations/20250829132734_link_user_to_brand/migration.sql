/*
  Warnings:

  - A unique constraint covering the columns `[brandId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "brandId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_brandId_key" ON "public"."User"("brandId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
