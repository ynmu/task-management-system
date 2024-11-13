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
    "totalDonations" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPledge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "largestGift" DOUBLE PRECISION,
    "largestGiftAppeal" TEXT,
    "firstGiftDate" TIMESTAMP(3),
    "lastGiftDate" TIMESTAMP(3),
    "lastGiftAmount" DOUBLE PRECISION,
    "lastGiftRequest" TEXT,
    "lastGiftAppeal" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "contactPhoneType" TEXT,
    "phoneRestrictions" BOOLEAN NOT NULL,
    "emailRestrictions" BOOLEAN NOT NULL,
    "communicationRestrictions" TEXT,
    "subscriptionEventsInPerson" BOOLEAN NOT NULL,
    "subscriptionEventsMagazine" BOOLEAN NOT NULL,
    "communicationPreference" TEXT,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventAttendees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventAttendees_AB_unique" ON "_EventAttendees"("A", "B");

-- CreateIndex
CREATE INDEX "_EventAttendees_B_index" ON "_EventAttendees"("B");

-- AddForeignKey
ALTER TABLE "_EventAttendees" ADD CONSTRAINT "_EventAttendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventAttendees" ADD CONSTRAINT "_EventAttendees_B_fkey" FOREIGN KEY ("B") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
