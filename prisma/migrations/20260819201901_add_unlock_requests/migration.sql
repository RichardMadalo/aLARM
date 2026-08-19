-- AlterTable
ALTER TABLE "RiskAccount" ADD COLUMN     "unlockDailyRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unlockWeeklyRequested" BOOLEAN NOT NULL DEFAULT false;
