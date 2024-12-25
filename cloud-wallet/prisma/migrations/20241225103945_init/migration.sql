/*
  Warnings:

  - You are about to drop the `Keys` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `privateKey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privateKey" TEXT NOT NULL,
ADD COLUMN     "publicKey" TEXT NOT NULL;

-- DropTable
DROP TABLE "Keys";
