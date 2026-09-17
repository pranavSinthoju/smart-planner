import { GoogleGenAI, Type } from "@google/genai";
import { ParsedTaskSchema, type ParsedTask, type SchedulePlacement, type SchedulingContext } from "@smart-planner/shared";
import type { LLMProvider } from "./types.js";

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

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-2.5-flash") {
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

  async proposeSchedule(_context: SchedulingContext): Promise<SchedulePlacement[]> {
    throw new Error("GeminiProvider.proposeSchedule not implemented yet");
  }
}
