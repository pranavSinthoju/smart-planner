import { z } from "zod";

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const TaskStatusSchema = z.enum(["UNSCHEDULED", "SCHEDULED", "COMPLETED"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Fixed weekly commitments (classes, work, etc). Recurs every week, so it's
// stored as a day-of-week + time-of-day rather than a specific date.
export const FixedEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(), // "HH:MM"
  endTime: z.string(),
});
export type FixedEvent = z.infer<typeof FixedEventSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  deadline: z.coerce.date(),
  durationMin: z.number().int().positive(),
  priority: PrioritySchema,
  status: TaskStatusSchema,
  scheduledStart: z.coerce.date().nullable().optional(),
  scheduledEnd: z.coerce.date().nullable().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// What the LLM extracts from a raw voice/text task entry.
export const ParsedTaskSchema = z.object({
  name: z.string(),
  deadline: z.string().nullable(), // ISO string, resolved by the LLM from relative phrasing
  estimatedDurationMinutes: z.number().int().positive(),
  priority: PrioritySchema,
});
export type ParsedTask = z.infer<typeof ParsedTaskSchema>;

// One task placement/move proposed by the scheduling LLM call.
export const SchedulePlacementSchema = z.object({
  taskId: z.string(),
  start: z.string(), // ISO
  end: z.string(),
  reason: z.string(),
});
export type SchedulePlacement = z.infer<typeof SchedulePlacementSchema>;

// Everything the scheduling call needs to decide where the new task (and
// any displaced tasks) should go.
export const SchedulingContextSchema = z.object({
  now: z.string(), // ISO
  fixedEvents: z.array(FixedEventSchema),
  tasks: z.array(TaskSchema),
  newTask: TaskSchema,
});
export type SchedulingContext = z.infer<typeof SchedulingContextSchema>;
