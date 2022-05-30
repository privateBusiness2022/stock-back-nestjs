/*
  Warnings:

  - You are about to drop the column `end` on the `Period` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Period` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Period` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Period" DROP COLUMN "end",
DROP COLUMN "start",
DROP COLUMN "status";

-- CreateTable
CREATE TABLE "Stage" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT E'PENDING',
    "periodId" INTEGER,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
