/*
  Warnings:

  - You are about to drop the `_RoleEvents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RoleEvents" DROP CONSTRAINT "_RoleEvents_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleEvents" DROP CONSTRAINT "_RoleEvents_B_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "roleId" INTEGER;

-- DropTable
DROP TABLE "_RoleEvents";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
