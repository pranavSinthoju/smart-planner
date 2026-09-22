import type {
  CreateFixedEventInput,
  FixedEvent,
  SchedulePlacement,
  Task,
} from "@smart-planner/shared";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
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
