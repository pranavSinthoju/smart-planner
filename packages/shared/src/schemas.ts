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

export const CreateFixedEventInputSchema = FixedEventSchema.omit({ id: true });
export type CreateFixedEventInput = z.infer<typeof CreateFixedEventInputSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  deadline: z.coerce.date().nullable().optional(), // no deadline = flexible/low-urgency, not "unscheduled by mistake"
  durationMin: z.number().int().positive(),
  priority: PrioritySchema,
  status: TaskStatusSchema,
  scheduledStart: z.coerce.date().nullable().optional(),
  scheduledEnd: z.coerce.date().nullable().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

// What's needed to create a task. status/scheduledStart/scheduledEnd are
// server-assigned (a new task always starts UNSCHEDULED).
export const CreateTaskInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  deadline: z.coerce.date().nullable().optional(),
  durationMin: z.number().int().positive(),
  priority: PrioritySchema,
});
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

// Applying a placement to a task — used both for an AI-proposed placement
// and a manual drag-and-drop override, which is why `reason` is required
// either way (e.g. "Moved manually by the user").
export const ApplyPlacementInputSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
  reason: z.string(),
});
export type ApplyPlacementInput = z.infer<typeof ApplyPlacementInputSchema>;

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

// The scheduling LLM call's raw output shape: only the tasks whose
// placement is new or changed, never a full replan of everything.
export const ProposeScheduleResponseSchema = z.object({
  placements: z.array(SchedulePlacementSchema),
});
export type ProposeScheduleResponse = z.infer<typeof ProposeScheduleResponseSchema>;
