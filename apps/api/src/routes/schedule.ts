import { Router } from "express";
import { prisma } from "../db.js";
import { getLLMProvider } from "../llm/index.js";
import { formatLocal } from "../time.js";

export const scheduleRouter = Router();

// Proposes where a task should go, using the DB as the source of truth for
// context: the fixed weekly schedule and every other non-completed task.
// Read-only — applying the result is a separate call to
// PATCH /api/tasks/:id/schedule, so the UI can show the reasoning first.
scheduleRouter.post("/tasks/:id/schedule/propose", async (req, res) => {
  const newTask = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!newTask) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const [fixedEvents, otherTasks] = await Promise.all([
    prisma.fixedEvent.findMany(),
    prisma.task.findMany({
      where: { id: { not: newTask.id }, status: { not: "COMPLETED" } },
    }),
  ]);

  try {
    const placements = await getLLMProvider().proposeSchedule({
      now: formatLocal(new Date()),
      fixedEvents,
      tasks: otherTasks,
      newTask,
    });
    res.json({ placements });
  } catch (err) {
    console.error("Schedule proposal failed:", err);
    res.status(502).json({ error: "Schedule proposal failed", message: (err as Error).message });
  }
});
