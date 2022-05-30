-- AlterTable
ALTER TABLE "ClientProfit" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "ClientProfit" ADD CONSTRAINT "ClientProfit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
