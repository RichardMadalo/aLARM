-- CreateTable
CREATE TABLE "RiskAccount" (
    "id" TEXT NOT NULL,
    "pairingKey" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'My Trading Account',
    "dailyLimitType" TEXT NOT NULL DEFAULT 'percent',
    "dailyLossLimit" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "dailyProfitTarget" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "weeklyLimitType" TEXT NOT NULL DEFAULT 'percent',
    "weeklyLossLimit" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "weeklyProfitTarget" DOUBLE PRECISION NOT NULL DEFAULT 12,
    "autoCloseOnBreach" BOOLEAN NOT NULL DEFAULT true,
    "blockNewTrades" BOOLEAN NOT NULL DEFAULT true,
    "manualLock" BOOLEAN NOT NULL DEFAULT false,
    "balance" DOUBLE PRECISION,
    "equity" DOUBLE PRECISION,
    "dailyPL" DOUBLE PRECISION,
    "weeklyPL" DOUBLE PRECISION,
    "dailyLocked" BOOLEAN NOT NULL DEFAULT false,
    "weeklyLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockReason" TEXT,
    "accountLogin" TEXT,
    "broker" TEXT,
    "currency" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskAccount_pairingKey_key" ON "RiskAccount"("pairingKey");
