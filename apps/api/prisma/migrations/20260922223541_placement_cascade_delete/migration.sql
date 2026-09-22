-- DropForeignKey
ALTER TABLE "Placement" DROP CONSTRAINT "Placement_taskId_fkey";

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
