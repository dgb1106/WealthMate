-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('SAVINGS', 'INVESTMENT', 'EXPENSE_REDUCTION');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'PAID', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "JarType" AS ENUM ('NECESSARY', 'FNIANCIAL_FREEDOM', 'PLAY', 'LONG_TERM_SAVING', 'EDUCATION', 'GIVING', 'INVESTMENT');

-- CreateTable
CREATE TABLE "Transactions" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "amount" DECIMAL(8,2) NOT NULL,
    "created_at" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTransactions" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "amount" DECIMAL(8,2) NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "created_at" DATE NOT NULL,
    "next_occurence" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "RecurringTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" BIGSERIAL NOT NULL,
    "jarId" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "TransactionType" NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budgets" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "limit_amount" DECIMAL(8,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "spent_amount" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "Budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goals" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "target_amount" DECIMAL(8,2) NOT NULL,
    "saved_amount" DECIMAL(8,2) NOT NULL,
    "status" "GoalStatus" NOT NULL,
    "due_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,

    CONSTRAINT "Goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jars" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "limit_amount" DECIMAL(8,2) NOT NULL,
    "type" "JarType" NOT NULL,
    "allocation_percentage" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "Jars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loans" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "due_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,
    "total_amount" DECIMAL(8,2) NOT NULL,
    "remaining_amount" DECIMAL(8,2) NOT NULL,
    "status" "LoanStatus" NOT NULL,
    "interest_rate" DECIMAL(8,2) NOT NULL,
    "monthly_payment" DECIMAL(8,2) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JWT" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" DATE NOT NULL,
    "created_at" DATE NOT NULL,

    CONSTRAINT "JWT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRecommendations" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "recommendation_text" VARCHAR(255) NOT NULL,
    "recommendation_type" "RecommendationType" NOT NULL,
    "created_at" DATE NOT NULL,

    CONSTRAINT "AIRecommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transactions_userId_idx" ON "Transactions"("userId");

-- CreateIndex
CREATE INDEX "Transactions_categoryId_idx" ON "Transactions"("categoryId");

-- CreateIndex
CREATE INDEX "Transactions_created_at_idx" ON "Transactions"("created_at");

-- CreateIndex
CREATE INDEX "RecurringTransactions_userId_idx" ON "RecurringTransactions"("userId");

-- CreateIndex
CREATE INDEX "RecurringTransactions_categoryId_idx" ON "RecurringTransactions"("categoryId");

-- CreateIndex
CREATE INDEX "RecurringTransactions_next_occurence_idx" ON "RecurringTransactions"("next_occurence");

-- CreateIndex
CREATE INDEX "Categories_jarId_idx" ON "Categories"("jarId");

-- CreateIndex
CREATE INDEX "Budgets_userId_idx" ON "Budgets"("userId");

-- CreateIndex
CREATE INDEX "Budgets_categoryId_idx" ON "Budgets"("categoryId");

-- CreateIndex
CREATE INDEX "Goals_userId_idx" ON "Goals"("userId");

-- CreateIndex
CREATE INDEX "Goals_status_idx" ON "Goals"("status");

-- CreateIndex
CREATE INDEX "Goals_due_date_idx" ON "Goals"("due_date");

-- CreateIndex
CREATE INDEX "Jars_name_idx" ON "Jars"("name");

-- CreateIndex
CREATE INDEX "Loans_userId_idx" ON "Loans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JWT_token_key" ON "JWT"("token");

-- CreateIndex
CREATE INDEX "JWT_userId_idx" ON "JWT"("userId");

-- CreateIndex
CREATE INDEX "AIRecommendations_userId_idx" ON "AIRecommendations"("userId");

-- CreateIndex
CREATE INDEX "AIRecommendations_recommendation_type_idx" ON "AIRecommendations"("recommendation_type");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransactions" ADD CONSTRAINT "RecurringTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransactions" ADD CONSTRAINT "RecurringTransactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_jarId_fkey" FOREIGN KEY ("jarId") REFERENCES "Jars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budgets" ADD CONSTRAINT "Budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budgets" ADD CONSTRAINT "Budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goals" ADD CONSTRAINT "Goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JWT" ADD CONSTRAINT "JWT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendations" ADD CONSTRAINT "AIRecommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
