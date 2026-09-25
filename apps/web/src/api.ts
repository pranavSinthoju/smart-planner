import type {
  CreateFixedEventInput,
  FixedEvent,
  SchedulePlacement,
  Task,
} from "@smart-planner/shared";

// In dev, VITE_API_URL is unset and requests go to the same origin, where
// Vite's dev-server proxy (vite.config.ts) forwards /api/* to localhost:4000.
// That proxy doesn't exist in the production build — Vercel serves static
// files with no backend of its own — so production sets VITE_API_URL to the
// deployed API's own origin (e.g. the Railway URL).
const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `Request to ${path} failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getFixedEvents: () => request<FixedEvent[]>("/fixed-events"),
  createFixedEvent: (input: CreateFixedEventInput) =>
    request<FixedEvent>("/fixed-events", { method: "POST", body: JSON.stringify(input) }),
  deleteFixedEvent: (id: string) => request<void>(`/fixed-events/${id}`, { method: "DELETE" }),

  getTasks: () => request<Task[]>("/tasks"),
  parseTask: (text: string) => request<Task>("/tasks/parse", { method: "POST", body: JSON.stringify({ text }) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),

  proposeSchedule: (taskId: string) =>
    request<{ placements: SchedulePlacement[] }>(`/tasks/${taskId}/schedule/propose`, { method: "POST" }),
  applyPlacement: (taskId: string, placement: { start: string; end: string; reason: string }) =>
    request<Task>(`/tasks/${taskId}/schedule`, { method: "PATCH", body: JSON.stringify(placement) }),
};
