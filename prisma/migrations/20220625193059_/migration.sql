-- CreateTable
CREATE TABLE "Commission" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "clientId" INTEGER,
    "periodId" INTEGER,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
