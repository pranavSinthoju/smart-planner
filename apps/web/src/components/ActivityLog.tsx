import type { SchedulePlacement } from "@smart-planner/shared";

interface ActivityLogProps {
  placements: SchedulePlacement[];
}

// Shows the reasons behind the most recent scheduling decision — the app's
// answer to "why did this end up here?" instead of being a black box.
export function ActivityLog({ placements }: ActivityLogProps) {
  if (placements.length === 0) {
    return <p className="empty-state">Add a task to see the AI's placement reasoning here.</p>;
  }

  return (
    <ul className="activity-log">
      {placements.map((p, i) => (
        <li key={`${p.taskId}-${i}`}>{p.reason}</li>
      ))}
    </ul>
  );
}
