import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateFixedEventInput, SchedulePlacement } from "@smart-planner/shared";
import { api } from "./api";

export function useFixedEvents() {
  return useQuery({ queryKey: ["fixed-events"], queryFn: api.getFixedEvents });
}

export function useTasks() {
  return useQuery({ queryKey: ["tasks"], queryFn: api.getTasks });
}

export function useCreateFixedEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFixedEventInput) => api.createFixedEvent(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fixed-events"] }),
  });
}

export function useDeleteFixedEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteFixedEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fixed-events"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

async function applyAll(placements: SchedulePlacement[]) {
  for (const p of placements) {
    await api.applyPlacement(p.taskId, p);
  }
}

// The full "add a task" flow: parse the raw text into a task, ask the LLM
// where it (and anything it displaces) should go, then apply every
// returned placement. Returns the placements so the UI can show the
// reasons for what just happened.
export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const task = await api.parseTask(text);
      const { placements } = await api.proposeSchedule(task.id);
      await applyAll(placements);
      return placements;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// Manual drag/resize override on the calendar.
export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, start, end }: { taskId: string; start: string; end: string }) =>
      api.applyPlacement(taskId, { start, end, reason: "Moved manually by the user." }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// Re-run scheduling for an already-existing unscheduled task.
export function useScheduleExistingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { placements } = await api.proposeSchedule(taskId);
      await applyAll(placements);
      return placements;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
