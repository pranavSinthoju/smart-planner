import type { Priority } from "@smart-planner/shared";

export const PRIORITY_COLORS: Record<Priority, { bg: string; border: string }> = {
  HIGH: { bg: "#dc2626", border: "#991b1b" }, // red
  MEDIUM: { bg: "#d97706", border: "#92400e" }, // amber
  LOW: { bg: "#16a34a", border: "#166534" }, // green
};

export const FIXED_EVENT_COLOR = { bg: "#64748b", border: "#334155" }; // slate
