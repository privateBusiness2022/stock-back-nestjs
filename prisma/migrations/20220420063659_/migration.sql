-- CreateTable
CREATE TABLE "AgentStock" (
    "id" SERIAL NOT NULL,
    "number" DECIMAL(65,30) NOT NULL,
    "periodId" INTEGER,
    "agentId" INTEGER,

    CONSTRAINT "AgentStock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentStock" ADD CONSTRAINT "AgentStock_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentStock" ADD CONSTRAINT "AgentStock_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE SET NULL ON UPDATE CASCADE;
