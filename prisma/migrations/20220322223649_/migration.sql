/*
  Warnings:

  - You are about to drop the column `projectId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_ceratedById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_periodId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_projectId_fkey";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "projectId",
ADD COLUMN     "periodId" INTEGER;

-- DropTable
DROP TABLE "Project";

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
