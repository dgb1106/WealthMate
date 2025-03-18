/*
  Warnings:

  - Added the required column `targetId` to the `FamilyTransactionContributions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FamilyTransactionContributions" ADD COLUMN     "targetId" BIGINT NOT NULL;
