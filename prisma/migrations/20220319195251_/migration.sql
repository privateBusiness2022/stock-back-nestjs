/*
  Warnings:

  - You are about to drop the column `active` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "active",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT E'ACTIVE';
