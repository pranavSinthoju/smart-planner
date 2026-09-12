import type { ParsedTask, SchedulePlacement, SchedulingContext } from "@smart-planner/shared";

// Vendor-agnostic contract. Route handlers and DB code depend only on this
// interface, never on a specific SDK — swapping Gemini for Claude later is
// just adding a new class here and flipping LLM_PROVIDER.
export interface LLMProvider {
  parseTask(text: string, now: Date): Promise<ParsedTask>;
  proposeSchedule(context: SchedulingContext): Promise<SchedulePlacement[]>;
}
