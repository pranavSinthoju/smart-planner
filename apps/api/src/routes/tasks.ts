import { Router } from "express";
import { z } from "zod";
import { ApplyPlacementInputSchema, CreateTaskInputSchema } from "@smart-planner/shared";
import { prisma } from "../db.js";
import { getLLMProvider } from "../llm/index.js";
import { friendlyLLMErrorMessage } from "../llm/errors.js";

export const tasksRouter = Router();

const ParseTaskRequestSchema = z.object({
  text: z.string().min(1),
});

tasksRouter.post("/tasks/parse", async (req, res) => {
  const body = ParseTaskRequestSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body", details: body.error.flatten() });
    return;
  }

  try {
    const parsed = await getLLMProvider().parseTask(body.data.text, new Date());
    const task = await prisma.task.create({
      data: {
        name: parsed.name,
        deadline: parsed.deadline ? new Date(parsed.deadline) : null,
        durationMin: parsed.estimatedDurationMinutes,
        priority: parsed.priority,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    console.error("Task parsing failed:", err);
    res.status(502).json({ error: "Task parsing failed", message: friendlyLLMErrorMessage(err) });
  }
});

tasksRouter.get("/tasks", async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { deadline: "asc" } });
  res.json(tasks);
});

tasksRouter.post("/tasks", async (req, res) => {
  const body = CreateTaskInputSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body", details: body.error.flatten() });
    return;
  }

  const task = await prisma.task.create({ data: body.data });
  res.status(201).json(task);
});

tasksRouter.delete("/tasks/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Task not found" });
  }
});

// Applies a placement — either an AI-proposed one or a manual drag-and-drop
// override — by updating the task's scheduled time and logging a Placement
// row with the reason, so the UI can always explain how a task got there.
tasksRouter.patch("/tasks/:id/schedule", async (req, res) => {
  const body = ApplyPlacementInputSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body", details: body.error.flatten() });
    return;
  }

  try {
    const [task] = await prisma.$transaction([
      prisma.task.update({
        where: { id: req.params.id },
        data: {
          scheduledStart: body.data.start,
          scheduledEnd: body.data.end,
          status: "SCHEDULED",
        },
      }),
      prisma.placement.create({
        data: {
          taskId: req.params.id,
          start: body.data.start,
          end: body.data.end,
          reason: body.data.reason,
        },
      }),
    ]);
    res.json(task);
  } catch {
    res.status(404).json({ error: "Task not found" });
  }
});

tasksRouter.get("/tasks/:id/placements", async (req, res) => {
  const placements = await prisma.placement.findMany({
    where: { taskId: req.params.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(placements);
});
