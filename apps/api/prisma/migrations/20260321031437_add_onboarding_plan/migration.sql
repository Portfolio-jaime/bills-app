-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FinancialPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyIncome" DECIMAL(15,2) NOT NULL,
    "incomeSource" TEXT NOT NULL,
    "housingCost" DECIMAL(15,2) NOT NULL,
    "foodBudget" DECIMAL(15,2) NOT NULL,
    "transportBudget" DECIMAL(15,2) NOT NULL,
    "healthBudget" DECIMAL(15,2) NOT NULL,
    "entertainmentBudget" DECIMAL(15,2) NOT NULL,
    "otherExpenses" DECIMAL(15,2) NOT NULL,
    "savingsGoal" DECIMAL(15,2) NOT NULL,
    "goals" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialPlan_userId_key" ON "FinancialPlan"("userId");

-- AddForeignKey
ALTER TABLE "FinancialPlan" ADD CONSTRAINT "FinancialPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
