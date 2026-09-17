import { GoogleGenAI, Type } from "@google/genai";
import {
  ParsedTaskSchema,
  ProposeScheduleResponseSchema,
  type ParsedTask,
  type SchedulePlacement,
  type SchedulingContext,
} from "@smart-planner/shared";
import type { LLMProvider } from "./types.js";

// Tasks may only be scheduled within this daily window (local time).
const WORKING_HOURS = { start: "08:00", end: "23:00" };

const PARSE_TASK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Short, human-readable name for the task.",
    },
    deadline: {
      type: Type.STRING,
      nullable: true,
      description:
        "The task's deadline as an ISO 8601 datetime, resolved from any relative phrasing " +
        "(e.g. 'Thursday', 'tomorrow') using the current date provided. Null if no deadline was stated.",
    },
    estimatedDurationMinutes: {
      type: Type.INTEGER,
      description: "Best-guess time to complete the task, in minutes. Estimate from context if not stated.",
    },
    priority: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Urgency/stakes implied by the text. Default to MEDIUM if unclear.",
    },
  },
  required: ["name", "deadline", "estimatedDurationMinutes", "priority"],
};

const PROPOSE_SCHEDULE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    placements: {
      type: Type.ARRAY,
      description:
        "Only tasks whose placement is newly assigned or has to change as a result of the new task. " +
        "Do not include tasks whose current placement is still fine.",
      items: {
        type: Type.OBJECT,
        properties: {
          taskId: { type: Type.STRING },
          start: { type: Type.STRING, description: "ISO 8601 datetime this task should start at." },
          end: { type: Type.STRING, description: "ISO 8601 datetime this task should end at." },
          reason: {
            type: Type.STRING,
            description:
              "One sentence explaining why this task was placed or moved here, written for the end user.",
          },
        },
        required: ["taskId", "start", "end", "reason"],
      },
    },
  },
  required: ["placements"],
};

const SCHEDULE_SYSTEM_INSTRUCTION = `You are a scheduling assistant for a weekly planner app.
You are given the user's fixed weekly commitments, a new task to place, and the other
currently-active tasks (with their current placement, if any).

Rules:
- Never schedule a task over any fixed event.
- Every task must be fully scheduled to finish at or before its own deadline.
- Only schedule within the working-hours window each day: ${WORKING_HOURS.start}-${WORKING_HOURS.end}.
- When there isn't enough open time for every task, higher-priority tasks and tasks with sooner
  deadlines take precedence — move a lower-priority/later-deadline task to a different open slot
  (still before its own deadline) rather than delaying the new or more urgent one.
- Prefer the earliest reasonable open slot for each task.
- Minimize disruption: only return tasks whose placement is newly assigned or has to change.
  Do not include tasks whose current placement is still fine.
- Give a short, one-sentence, user-facing reason for each placement or move.

Respond with JSON matching the given schema only.`;

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-3.6-flash") {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async parseTask(text: string, now: Date): Promise<ParsedTask> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: text,
      config: {
        systemInstruction:
          "You are a task-parsing assistant for a weekly planner app. Extract a single structured " +
          "task from the user's raw input (typed or voice-transcribed text). The current date and " +
          `time is ${now.toISOString()} — resolve any relative dates/times against it. If the text ` +
          "describes more than one task, capture only the primary one.",
        responseMimeType: "application/json",
        responseSchema: PARSE_TASK_SCHEMA,
      },
    });

    const raw = response.text;
    if (!raw) throw new Error("Gemini returned an empty response while parsing a task");

    const parsed = ParsedTaskSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Gemini's task-parsing output failed validation: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async proposeSchedule(context: SchedulingContext): Promise<SchedulePlacement[]> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: JSON.stringify(context),
      config: {
        systemInstruction: SCHEDULE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PROPOSE_SCHEDULE_SCHEMA,
      },
    });

    const raw = response.text;
    if (!raw) throw new Error("Gemini returned an empty response while proposing a schedule");

    const parsed = ProposeScheduleResponseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`Gemini's scheduling output failed validation: ${parsed.error.message}`);
    }
    return parsed.data.placements;
  }
}
