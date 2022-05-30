/*
  Warnings:

  - A unique constraint covering the columns `[periodId]` on the table `AgentStock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AgentStock_periodId_key" ON "AgentStock"("periodId");
