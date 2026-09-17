import { Router } from "express";
import { SchedulingContextSchema } from "@smart-planner/shared";
import { getLLMProvider } from "../llm/index.js";

export const scheduleRouter = Router();

scheduleRouter.post("/schedule/propose", async (req, res) => {
  const body = SchedulingContextSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body", details: body.error.flatten() });
    return;
  }

  try {
    const placements = await getLLMProvider().proposeSchedule(body.data);
    res.json({ placements });
  } catch (err) {
    console.error("Schedule proposal failed:", err);
    res.status(502).json({ error: "Schedule proposal failed", message: (err as Error).message });
  }
});
