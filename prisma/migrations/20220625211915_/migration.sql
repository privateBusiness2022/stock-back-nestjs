/*
  Warnings:

  - You are about to drop the column `clientId` on the `Commission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_clientId_fkey";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "clientId",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
