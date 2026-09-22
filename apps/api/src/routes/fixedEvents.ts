import { Router } from "express";
import { CreateFixedEventInputSchema } from "@smart-planner/shared";
import { prisma } from "../db.js";

export const fixedEventsRouter = Router();

fixedEventsRouter.get("/fixed-events", async (_req, res) => {
  const events = await prisma.fixedEvent.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  res.json(events);
});

fixedEventsRouter.post("/fixed-events", async (req, res) => {
  const body = CreateFixedEventInputSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body", details: body.error.flatten() });
    return;
  }

  const event = await prisma.fixedEvent.create({ data: body.data });
  res.status(201).json(event);
});

fixedEventsRouter.delete("/fixed-events/:id", async (req, res) => {
  try {
    await prisma.fixedEvent.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Fixed event not found" });
  }
});
