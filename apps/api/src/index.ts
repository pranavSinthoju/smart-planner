import "dotenv/config";
import cors from "cors";
import express from "express";
import { tasksRouter } from "./routes/tasks.js";
import { scheduleRouter } from "./routes/schedule.js";
import { fixedEventsRouter } from "./routes/fixedEvents.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", tasksRouter);
app.use("/api", scheduleRouter);
app.use("/api", fixedEventsRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
