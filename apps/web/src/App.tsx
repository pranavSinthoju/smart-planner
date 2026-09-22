import { useState } from "react";
import type { SchedulePlacement } from "@smart-planner/shared";
import { Calendar } from "./components/Calendar";
import { AddTaskForm } from "./components/AddTaskForm";
import { AddFixedEventForm } from "./components/AddFixedEventForm";
import { UnscheduledTasks } from "./components/UnscheduledTasks";
import { ActivityLog } from "./components/ActivityLog";
import { useDeleteFixedEvent, useFixedEvents, useTasks } from "./hooks";

export default function App() {
  const fixedEventsQuery = useFixedEvents();
  const tasksQuery = useTasks();
  const deleteFixedEvent = useDeleteFixedEvent();
  const [lastPlacements, setLastPlacements] = useState<SchedulePlacement[]>([]);

  const fixedEvents = fixedEventsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Smart Weekly Planner</h1>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <section>
            <h2>Add a task</h2>
            <AddTaskForm onScheduled={setLastPlacements} />
          </section>

          <section>
            <h2>Why it's placed there</h2>
            <ActivityLog placements={lastPlacements} />
          </section>

          <section>
            <h2>Unscheduled</h2>
            <UnscheduledTasks tasks={tasks} onScheduled={setLastPlacements} />
          </section>

          <section>
            <h2>Fixed schedule</h2>
            <AddFixedEventForm />
            <ul className="fixed-event-list">
              {fixedEvents.map((fe) => (
                <li key={fe.id}>
                  <span>
                    {fe.title} · {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][fe.dayOfWeek]}{" "}
                    {fe.startTime}–{fe.endTime}
                  </span>
                  <button className="danger" onClick={() => deleteFixedEvent.mutate(fe.id)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="calendar-pane">
          {fixedEventsQuery.isLoading || tasksQuery.isLoading ? (
            <p>Loading…</p>
          ) : (
            <Calendar fixedEvents={fixedEvents} tasks={tasks} />
          )}
        </main>
      </div>
    </div>
  );
}
