/*
  Warnings:

  - You are about to drop the column `priceOfOne` on the `ClientProfit` table. All the data in the column will be lost.
  - Added the required column `price` to the `ClientProfit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientProfit" DROP COLUMN "priceOfOne",
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;
