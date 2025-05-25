/*
  Warnings:

  - You are about to drop the column `roleId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_roleId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "roleId";

-- CreateTable
CREATE TABLE "RoleOnEvent" (
    "eventId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "RoleOnEvent_pkey" PRIMARY KEY ("eventId","roleId")
);

-- AddForeignKey
ALTER TABLE "RoleOnEvent" ADD CONSTRAINT "RoleOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnEvent" ADD CONSTRAINT "RoleOnEvent_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
