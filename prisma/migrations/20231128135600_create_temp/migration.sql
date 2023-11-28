/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `temp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `temp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "temp" ADD COLUMN     "email" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "temp_email_key" ON "temp"("email");
