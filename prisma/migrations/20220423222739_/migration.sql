-- CreateTable
CREATE TABLE "RequestToWithdrawal" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL DEFAULT E'PENDING',
    "userId" INTEGER,
    "clientId" INTEGER,

    CONSTRAINT "RequestToWithdrawal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RequestToWithdrawal" ADD CONSTRAINT "RequestToWithdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToWithdrawal" ADD CONSTRAINT "RequestToWithdrawal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
