-- CreateEnum
CREATE TYPE "PreferredMood" AS ENUM ('IRRITATION', 'ENCOURAGEMENT');

-- CreateEnum
CREATE TYPE "PreferredGoal" AS ENUM ('SAVING', 'INVESTMENT');

-- CreateTable
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
    "current_balance" DECIMAL(8,2) NOT NULL,
    "create_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");
