-- AlterTable
ALTER TABLE "FinancialPlan" ADD COLUMN     "subscriptionsBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "utilitiesBudget" DECIMAL(15,2) NOT NULL DEFAULT 0;
