-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "projectId" INTEGER;

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProfit" (
    "id" SERIAL NOT NULL,
    "profit" DECIMAL(65,30) NOT NULL,
    "stocksNumber" DECIMAL(65,30) NOT NULL,
    "priceOfOne" DECIMAL(65,30) NOT NULL,
    "clientId" INTEGER,
    "stutus" "Status" NOT NULL DEFAULT E'PENDING',
    "stageId" INTEGER,

    CONSTRAINT "ClientProfit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfit" ADD CONSTRAINT "ClientProfit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProfit" ADD CONSTRAINT "ClientProfit_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
