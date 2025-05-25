/*
  Warnings:

  - You are about to drop the `Attendee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendee" DROP CONSTRAINT "Attendee_eventId_fkey";

-- DropTable
DROP TABLE "Attendee";

-- CreateTable
CREATE TABLE "Donor" (
    "id" SERIAL NOT NULL,
    "pmm" TEXT,
    "smm" TEXT,
    "vmm" TEXT,
    "exclude" BOOLEAN NOT NULL,
    "deceased" BOOLEAN NOT NULL,
    "firstName" TEXT NOT NULL,
    "nickName" TEXT,
    "lastName" TEXT NOT NULL,
    "organizationName" TEXT,
    "totalDonations" INTEGER NOT NULL,
    "totalPledge" INTEGER NOT NULL,
    "largestGift" INTEGER NOT NULL,
    "largestGiftAppeal" TEXT NOT NULL,
    "firstGiftDate" BIGINT NOT NULL,
    "lastGiftDate" BIGINT NOT NULL,
    "lastGiftAmount" INTEGER NOT NULL,
    "lastGiftRequest" BIGINT NOT NULL,
    "lastGiftAppeal" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "contactPhoneType" TEXT NOT NULL,
    "phoneRestrictions" TEXT,
    "emailRestrictions" TEXT,
    "communicationRestrictions" TEXT,
    "subscriptionInPerson" TEXT NOT NULL,
    "subscriptionMagazine" TEXT NOT NULL,
    "communicationPreference" TEXT,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorOnEvent" (
    "id" SERIAL NOT NULL,
    "donorId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "DonorOnEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DonorOnEvent_donorId_eventId_key" ON "DonorOnEvent"("donorId", "eventId");

-- AddForeignKey
ALTER TABLE "DonorOnEvent" ADD CONSTRAINT "DonorOnEvent_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorOnEvent" ADD CONSTRAINT "DonorOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
