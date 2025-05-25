-- CreateEnum
CREATE TYPE "CommunicationPreference" AS ENUM ('Holiday_Card', 'Survey', 'Event', 'Thank_you', 'Newsletter', 'Research_update');

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleOnEvent" (
    "eventId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "RoleOnEvent_pkey" PRIMARY KEY ("eventId","roleId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "employeeNumber" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
    "communicationPreference" "CommunicationPreference"[],

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
CREATE UNIQUE INDEX "Role_roleName_key" ON "Role"("roleName");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeNumber_key" ON "User"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "DonorOnEvent_donorId_eventId_key" ON "DonorOnEvent"("donorId", "eventId");

-- AddForeignKey
ALTER TABLE "RoleOnEvent" ADD CONSTRAINT "RoleOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnEvent" ADD CONSTRAINT "RoleOnEvent_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorOnEvent" ADD CONSTRAINT "DonorOnEvent_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorOnEvent" ADD CONSTRAINT "DonorOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
