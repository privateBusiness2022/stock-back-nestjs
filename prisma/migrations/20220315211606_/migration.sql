-- CreateTable
CREATE TABLE "ApiKey" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" SERIAL NOT NULL,
    "ipRestrictions" JSONB,
    "apiKey" TEXT NOT NULL,
    "name" TEXT,
    "referrerRestrictions" JSONB,
    "scopes" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_apiKey_key" ON "ApiKey"("apiKey");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
