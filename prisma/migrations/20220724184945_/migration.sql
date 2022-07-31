/*
  Warnings:

  - You are about to drop the column `stocks` on the `ProjectFund` table. All the data in the column will be lost.
  - Added the required column `fund` to the `ProjectFund` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectFund" DROP COLUMN "stocks",
ADD COLUMN     "fund" INTEGER NOT NULL;
