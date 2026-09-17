import { Router } from "express";
import { z } from "zod";
import { getLLMProvider } from "../llm/index.js";

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
    res.json(parsed);
  } catch (err) {
    console.error("Task parsing failed:", err);
    res.status(502).json({ error: "Task parsing failed", message: (err as Error).message });
  }
});
