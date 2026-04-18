-- CreateTable
CREATE TABLE "IntegrationRequest" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationRequest_workspaceId_type_key" ON "IntegrationRequest"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "IntegrationRequest_type_createdAt_idx" ON "IntegrationRequest"("type", "createdAt");
