/*
  Warnings:

  - You are about to drop the column `periodId` on the `Commission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_periodId_fkey";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "periodId",
ADD COLUMN     "stageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
