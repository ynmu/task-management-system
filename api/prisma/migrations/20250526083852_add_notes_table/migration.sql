-- DropForeignKey
ALTER TABLE "RoleOnEvent" DROP CONSTRAINT "RoleOnEvent_eventId_fkey";

-- DropForeignKey
ALTER TABLE "RoleOnEvent" DROP CONSTRAINT "RoleOnEvent_roleId_fkey";

-- AddForeignKey
ALTER TABLE "RoleOnEvent" ADD CONSTRAINT "RoleOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnEvent" ADD CONSTRAINT "RoleOnEvent_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
