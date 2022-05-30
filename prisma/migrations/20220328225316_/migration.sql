-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('STARTED', 'STOPPED', 'PENDING');

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "status" "PeriodStatus" NOT NULL DEFAULT E'PENDING';
