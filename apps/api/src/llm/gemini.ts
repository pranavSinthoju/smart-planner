import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ParsedTask, SchedulePlacement, SchedulingContext } from "@smart-planner/shared";
import type { LLMProvider } from "./types.js";

// Structure only for now — the actual prompts (task parsing, scheduling)
// are a feature step of their own, built after the skeleton is running.
export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async parseTask(_text: string, _now: Date): Promise<ParsedTask> {
    throw new Error("GeminiProvider.parseTask not implemented yet");
  }

  async proposeSchedule(_context: SchedulingContext): Promise<SchedulePlacement[]> {
    throw new Error("GeminiProvider.proposeSchedule not implemented yet");
  }
}
