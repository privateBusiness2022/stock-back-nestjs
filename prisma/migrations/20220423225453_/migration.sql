/*
  Warnings:

  - Added the required column `withdrawDate` to the `RequestToWithdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestToWithdrawal" ADD COLUMN     "withdrawDate" TIMESTAMP(3) NOT NULL;
