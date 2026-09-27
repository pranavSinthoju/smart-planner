import type { Priority } from "@smart-planner/shared";

// Design system maps to three semantic colors, not one per priority level:
// violet is the default "AI placed this" accent, amber calls out urgency.
// Color is never the only signal — priority is also shown as text (see
// UnscheduledTasks) and reasons are always shown in the activity log.
export const PRIORITY_COLORS: Record<Priority, { bg: string; border: string }> = {
  HIGH: { bg: "#F5A524", border: "#C9860F" }, // amber — urgent
  MEDIUM: { bg: "#8B7CF9", border: "#5847D6" }, // violet — default AI accent
  LOW: { bg: "#8B7CF9", border: "#5847D6" },
};

export const FIXED_EVENT_COLOR = { bg: "#7C8798", border: "#5B6472" }; // gray-blue
