/*
  Warnings:

  - You are about to drop the column `phoneType` on the `Attendee` table. All the data in the column will be lost.
  - Added the required column `totalDonations` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" DROP COLUMN "phoneType",
ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "pmm" TEXT,
ADD COLUMN     "smm" TEXT,
ADD COLUMN     "totalDonations" INTEGER NOT NULL,
ADD COLUMN     "vmm" TEXT;
