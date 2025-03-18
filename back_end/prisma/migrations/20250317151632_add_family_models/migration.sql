-- Create tables for enum types
CREATE TABLE "PreferredMood" (
    "value" VARCHAR(50) PRIMARY KEY
);
INSERT INTO "PreferredMood" ("value") VALUES ('IRRITATION'), ('ENCOURAGEMENT');

CREATE TABLE "PreferredGoal" (
    "value" VARCHAR(50) PRIMARY KEY
);
INSERT INTO "PreferredGoal" ("value") VALUES ('SAVING'), ('INVESTMENT');

CREATE TABLE "TransactionType" (
    "value" VARCHAR(50) PRIMARY KEY
);
INSERT INTO "TransactionType" ("value") VALUES ('INCOME'), ('EXPENSE');

CREATE TABLE "Frequency" (
    "value" VARCHAR(50) PRIMARY KEY
);
INSERT INTO "Frequency" ("value") VALUES ('DAILY'), ('WEEKLY'), ('MONTHLY'), ('YEARLY'), ('BIWEEKLY'), ('QUARTERLY');

CREATE TABLE "GoalStatus" (
    "value" VARCHAR(50) PRIMARY KEY
);
INSERT INTO "GoalStatus" ("value") VALUES ('PENDING'), ('IN_PROGRESS'), ('COMPLETED');
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "job" VARCHAR(255) NOT NULL,
    "preferred_mood" VARCHAR(50) NOT NULL,
    "preferred_goal" VARCHAR(50) NOT NULL,
    "hash_password" VARCHAR(255) NOT NULL,
    "current_balance" DECIMAL(14,2) NOT NULL,
    "create_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Users_preferred_mood_fkey" FOREIGN KEY ("preferred_mood") REFERENCES "PreferredMood"("value"),
    CONSTRAINT "Users_preferred_goal_fkey" FOREIGN KEY ("preferred_goal") REFERENCES "PreferredGoal"("value")
);
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NOT NULL,
    "job" VARCHAR(255) NOT NULL,
    "preferred_mood" "PreferredMood" NOT NULL,
    "preferred_goal" "PreferredGoal" NOT NULL,
    "hash_password" VARCHAR(255) NOT NULL,
    "current_balance" DECIMAL(14,2) NOT NULL,
    "create_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "amount" DECIMAL(11,2) NOT NULL,
    "created_at" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringTransactions" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "amount" DECIMAL(11,2) NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "created_at" DATE NOT NULL,
    "next_occurence" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "RecurringTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "TransactionType" NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budgets" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "limit_amount" DECIMAL(11,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "spent_amount" DECIMAL(11,2) NOT NULL,

    CONSTRAINT "Budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goals" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "target_amount" DECIMAL(11,2) NOT NULL,
    "saved_amount" DECIMAL(11,2) NOT NULL,
    "status" "GoalStatus" NOT NULL,
    "due_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,

    CONSTRAINT "Goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loans" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "due_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,
    "total_amount" DECIMAL(11,2) NOT NULL,
    "remaining_amount" DECIMAL(11,2) NOT NULL,
    "status" "LoanStatus" NOT NULL,
    "interest_rate" DECIMAL(11,2) NOT NULL,
    "monthly_payment" DECIMAL(11,2) NOT NULL,
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
CREATE TABLE "FamilyGroups" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(1000),
    "created_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL,
    "avatar_url" VARCHAR(500),

    CONSTRAINT "FamilyGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMembers" (
    "id" BIGSERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "FamilyMemberRole" NOT NULL,
    "joined_at" DATE NOT NULL,

    CONSTRAINT "FamilyMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyInvitations" (
    "id" BIGSERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeEmail" VARCHAR(255) NOT NULL,
    "status" "InvitationStatus" NOT NULL,
    "created_at" DATE NOT NULL,
    "expires_at" DATE NOT NULL,

    CONSTRAINT "FamilyInvitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyBudgets" (
    "id" BIGSERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "limit_amount" DECIMAL(11,2) NOT NULL,
    "spent_amount" DECIMAL(11,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "FamilyBudgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyGoals" (
    "id" BIGSERIAL NOT NULL,
    "groupId" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "target_amount" DECIMAL(11,2) NOT NULL,
    "saved_amount" DECIMAL(11,2) NOT NULL,
    "status" "GoalStatus" NOT NULL,
    "due_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "FamilyGoals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyTransactionContributions" (
    "id" BIGSERIAL NOT NULL,
    "transactionId" BIGINT NOT NULL,
    "groupId" BIGINT NOT NULL,
    "amount" DECIMAL(11,2) NOT NULL,
    "contributionType" VARCHAR(20) NOT NULL,
    "budgetId" BIGINT,
    "goalId" BIGINT,
    "created_at" DATE NOT NULL,

    CONSTRAINT "FamilyTransactionContributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

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
CREATE INDEX "Loans_userId_idx" ON "Loans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JWT_token_key" ON "JWT"("token");

-- CreateIndex
CREATE INDEX "JWT_userId_idx" ON "JWT"("userId");

-- CreateIndex
CREATE INDEX "FamilyMembers_groupId_idx" ON "FamilyMembers"("groupId");

-- CreateIndex
CREATE INDEX "FamilyMembers_userId_idx" ON "FamilyMembers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMembers_groupId_userId_key" ON "FamilyMembers"("groupId", "userId");

-- CreateIndex
CREATE INDEX "FamilyInvitations_groupId_idx" ON "FamilyInvitations"("groupId");

-- CreateIndex
CREATE INDEX "FamilyInvitations_inviterId_idx" ON "FamilyInvitations"("inviterId");

-- CreateIndex
CREATE INDEX "FamilyInvitations_inviteeEmail_idx" ON "FamilyInvitations"("inviteeEmail");

-- CreateIndex
CREATE INDEX "FamilyBudgets_groupId_idx" ON "FamilyBudgets"("groupId");

-- CreateIndex
CREATE INDEX "FamilyBudgets_categoryId_idx" ON "FamilyBudgets"("categoryId");

-- CreateIndex
CREATE INDEX "FamilyBudgets_created_by_idx" ON "FamilyBudgets"("created_by");

-- CreateIndex
CREATE INDEX "FamilyGoals_groupId_idx" ON "FamilyGoals"("groupId");

-- CreateIndex
CREATE INDEX "FamilyGoals_created_by_idx" ON "FamilyGoals"("created_by");

-- CreateIndex
CREATE INDEX "FamilyGoals_status_idx" ON "FamilyGoals"("status");

-- CreateIndex
CREATE INDEX "FamilyTransactionContributions_transactionId_idx" ON "FamilyTransactionContributions"("transactionId");

-- CreateIndex
CREATE INDEX "FamilyTransactionContributions_groupId_idx" ON "FamilyTransactionContributions"("groupId");

-- CreateIndex
CREATE INDEX "FamilyTransactionContributions_budgetId_idx" ON "FamilyTransactionContributions"("budgetId");

-- CreateIndex
CREATE INDEX "FamilyTransactionContributions_goalId_idx" ON "FamilyTransactionContributions"("goalId");

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
ALTER TABLE "Goals" ADD CONSTRAINT "Goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loans" ADD CONSTRAINT "Loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JWT" ADD CONSTRAINT "JWT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembers" ADD CONSTRAINT "FamilyMembers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMembers" ADD CONSTRAINT "FamilyMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitations" ADD CONSTRAINT "FamilyInvitations_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvitations" ADD CONSTRAINT "FamilyInvitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyBudgets" ADD CONSTRAINT "FamilyBudgets_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyBudgets" ADD CONSTRAINT "FamilyBudgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyBudgets" ADD CONSTRAINT "FamilyBudgets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyGoals" ADD CONSTRAINT "FamilyGoals_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyGoals" ADD CONSTRAINT "FamilyGoals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTransactionContributions" ADD CONSTRAINT "FamilyTransactionContributions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTransactionContributions" ADD CONSTRAINT "FamilyTransactionContributions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FamilyGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTransactionContributions" ADD CONSTRAINT "FamilyTransactionContributions_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "FamilyBudgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyTransactionContributions" ADD CONSTRAINT "FamilyTransactionContributions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FamilyGoals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
