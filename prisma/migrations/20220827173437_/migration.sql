-- AlterTable
ALTER TABLE "ProjectFund" ALTER COLUMN "fund" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RequestToWithdrawal" ADD COLUMN     "price" DECIMAL(65,30);
