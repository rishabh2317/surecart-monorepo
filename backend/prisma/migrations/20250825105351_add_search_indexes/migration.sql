-- CreateIndex
CREATE INDEX "Collection_name_description_idx" ON "public"."Collection"("name", "description");

-- CreateIndex
CREATE INDEX "Product_name_description_idx" ON "public"."Product"("name", "description");
