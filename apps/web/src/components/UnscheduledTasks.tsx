import { format } from "date-fns";
import type { SchedulePlacement, Task } from "@smart-planner/shared";
import { useDeleteTask, useScheduleExistingTask } from "../hooks";

interface UnscheduledTasksProps {
  tasks: Task[];
  onScheduled: (placements: SchedulePlacement[]) => void;
}

export function UnscheduledTasks({ tasks, onScheduled }: UnscheduledTasksProps) {
  const scheduleTask = useScheduleExistingTask();
  const deleteTask = useDeleteTask();
  const unscheduled = tasks.filter((t) => t.status === "UNSCHEDULED");

  if (unscheduled.length === 0) {
    return <p className="empty-state">No unscheduled tasks.</p>;
  }

  return (
    <ul className="unscheduled-list">
      {unscheduled.map((t) => (
        <li key={t.id} className={`priority-${t.priority.toLowerCase()}`}>
          <div className="unscheduled-task-info">
            <span className="task-name">{t.name}</span>
            <span className="task-deadline">
              {t.deadline ? `Due ${format(new Date(t.deadline), "EEE MMM d, h:mm a")}` : "No deadline"}
            </span>
          </div>
          <div className="unscheduled-task-actions">
            <button
              onClick={() => scheduleTask.mutate(t.id, { onSuccess: onScheduled })}
              disabled={scheduleTask.isPending}
            >
              Schedule
            </button>
            <button className="danger" onClick={() => deleteTask.mutate(t.id)}>
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
