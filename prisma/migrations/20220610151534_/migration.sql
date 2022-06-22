/*
  Warnings:

  - You are about to drop the column `projectId` on the `Period` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OTHER';

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_projectId_fkey";

-- AlterTable
ALTER TABLE "Period" DROP COLUMN "projectId";

-- CreateTable
CREATE TABLE "ProjectFund" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER,
    "stocks" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodId" INTEGER,

    CONSTRAINT "ProjectFund_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectFund" ADD CONSTRAINT "ProjectFund_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFund" ADD CONSTRAINT "ProjectFund_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
