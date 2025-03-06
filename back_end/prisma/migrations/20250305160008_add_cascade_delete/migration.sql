/*
  Warnings:

  - You are about to drop the column `jarId` on the `Categories` table. All the data in the column will be lost.
  - You are about to drop the `Jars` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIRecommendations" DROP CONSTRAINT "AIRecommendations_userId_fkey";

-- DropForeignKey
ALTER TABLE "Budgets" DROP CONSTRAINT "Budgets_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Budgets" DROP CONSTRAINT "Budgets_userId_fkey";

-- DropForeignKey
ALTER TABLE "Categories" DROP CONSTRAINT "Categories_jarId_fkey";

-- DropForeignKey
ALTER TABLE "JWT" DROP CONSTRAINT "JWT_userId_fkey";

-- DropForeignKey
ALTER TABLE "Loans" DROP CONSTRAINT "Loans_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringTransactions" DROP CONSTRAINT "RecurringTransactions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringTransactions" DROP CONSTRAINT "RecurringTransactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_userId_fkey";

-- DropIndex
DROP INDEX "Categories_jarId_idx";

-- AlterTable
ALTER TABLE "Categories" DROP COLUMN "jarId";

-- DropTable
DROP TABLE "Jars";

-- DropEnum
DROP TYPE "JarType";

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransactions" ADD CONSTRAINT "RecurringTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransactions" ADD CONSTRAINT "RecurringTransactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budgets" ADD CONSTRAINT "Budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budgets" ADD CONSTRAINT "Budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JWT" ADD CONSTRAINT "JWT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendations" ADD CONSTRAINT "AIRecommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
