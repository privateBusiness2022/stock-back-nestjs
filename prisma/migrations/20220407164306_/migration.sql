/*
  Warnings:

  - A unique constraint covering the columns `[periodId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ClintStocks" ADD COLUMN     "periodId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_periodId_key" ON "Stock"("periodId");

-- AddForeignKey
ALTER TABLE "ClintStocks" ADD CONSTRAINT "ClintStocks_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
