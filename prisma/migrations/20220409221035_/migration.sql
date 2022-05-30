/*
  Warnings:

  - Added the required column `dividendEnd` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "dividendEnd" TIMESTAMP(3) NOT NULL;
